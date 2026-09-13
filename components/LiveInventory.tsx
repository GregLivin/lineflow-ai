'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type DemoUser = { name:string; role:string; username:string };
type InventoryItem = {
  id:string;
  material_type:string;
  material_name:string;
  part_number:string|null;
  location:string;
  on_hand:number;
  reserved:number;
  in_transit:number;
  low_stock_threshold:number;
  updated_at:string;
};

type MovementType = 'Incoming' | 'Outgoing';

const locations = ['Soccer Field','Hotdog','Triangle','Racks','Fence Line','Line 1','Line 2','Line 3'];

export default function LiveInventory({user}:{user:DemoUser}){
  const isTristen=user.username==='tristen';
  const canManage=['tammy','chance','debbie','jose','greg','tristen'].includes(user.username);
  const [items,setItems]=useState<InventoryItem[]>([]);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState('');
  const [filter,setFilter]=useState('All');
  const [name,setName]=useState('');
  const [partNumber,setPartNumber]=useState('');
  const [materialType,setMaterialType]=useState(isTristen?'Hood':'Boom');
  const [location,setLocation]=useState('');
  const [onHand,setOnHand]=useState(0);
  const [threshold,setThreshold]=useState(1);
  const [movementQty,setMovementQty]=useState<Record<string,number>>({});
  const [savingId,setSavingId]=useState<string|null>(null);

  async function syncReservations(){
    await supabase.rpc('sync_inventory_reservations');
  }

  async function load(){
    let query=supabase.from('inventory').select('*').order('material_type').order('material_name');
    if(isTristen) query=query.eq('material_type','Hood');
    const {data,error}=await query;
    setMessage(error?'Unable to load live inventory.':'');
    setItems((data??[]) as InventoryItem[]);
    setLoading(false);
  }

  useEffect(()=>{
    load();
    const channel=supabase.channel(`lineflow-live-inventory-${user.username}`)
      .on('postgres_changes',{event:'*',schema:'public',table:'inventory'},()=>load())
      .subscribe();
    return()=>{supabase.removeChannel(channel)};
  },[user.username]);

  const visible=useMemo(()=>items.filter(item=>filter==='All'||item.material_type===filter),[items,filter]);
  const totals=useMemo(()=>{
    const available=items.reduce((sum,item)=>sum+Math.max(0,item.on_hand-item.reserved),0);
    const reserved=items.reduce((sum,item)=>sum+item.reserved,0);
    const low=items.filter(item=>(item.on_hand-item.reserved)<=item.low_stock_threshold).length;
    const incoming=items.reduce((sum,item)=>sum+item.in_transit,0);
    return {available,reserved,low,incoming,items:items.length};
  },[items]);

  function updateLocal(id:string,field:keyof InventoryItem,value:string|number){
    setItems(current=>current.map(item=>item.id===id?{...item,[field]:value} as InventoryItem:item));
  }

  async function addItem(e:FormEvent){
    e.preventDefault();
    if(!canManage||!name.trim()||!location.trim())return;
    const type=isTristen?'Hood':materialType;
    const {error}=await supabase.from('inventory').insert({
      material_type:type,
      material_name:name.trim(),
      part_number:partNumber.trim()||null,
      location:location.trim(),
      on_hand:Math.max(0,onHand),
      reserved:0,
      in_transit:0,
      low_stock_threshold:Math.max(0,threshold),
      updated_at:new Date().toISOString()
    });
    if(error){setMessage('Inventory item could not be added.');return;}
    await syncReservations();
    setName('');setPartNumber('');setLocation('');setOnHand(0);setThreshold(1);
    setMessage('Inventory item added and open material requests were checked automatically.');
    await load();
  }

  async function saveItem(item:InventoryItem){
    if(!canManage)return;
    if(isTristen&&item.material_type!=='Hood')return;
    setSavingId(item.id);
    const {error}=await supabase.from('inventory').update({
      material_type:isTristen?'Hood':item.material_type,
      material_name:item.material_name.trim(),
      part_number:item.part_number?.trim()||null,
      location:item.location.trim(),
      on_hand:Math.max(0,Number(item.on_hand)||0),
      in_transit:Math.max(0,Number(item.in_transit)||0),
      low_stock_threshold:Math.max(0,Number(item.low_stock_threshold)||0),
      updated_at:new Date().toISOString()
    }).eq('id',item.id);
    if(!error)await syncReservations();
    setSavingId(null);
    setMessage(error?'Inventory item could not be saved.':`${item.material_name} updated and reservations recalculated.`);
    if(!error)await load();
  }

  async function recordMovement(item:InventoryItem,type:MovementType){
    if(!canManage)return;
    const qty=Math.max(1,Number(movementQty[item.id])||1);
    const available=Math.max(0,item.on_hand-item.reserved);
    if(type==='Outgoing'&&qty>available){setMessage(`${item.material_name} has only ${available} unreserved units available. Reserved stock is protected for active requests.`);return;}
    const nextOnHand=type==='Incoming'?item.on_hand+qty:item.on_hand-qty;
    setSavingId(item.id);
    const {error:updateError}=await supabase.from('inventory').update({on_hand:nextOnHand,updated_at:new Date().toISOString()}).eq('id',item.id);
    if(updateError){setSavingId(null);setMessage('Inventory movement could not be saved.');return;}
    const {error:movementError}=await supabase.from('inventory_movements').insert({
      inventory_id:item.id,
      movement_type:type,
      quantity:qty,
      from_location:type==='Outgoing'?item.location:null,
      to_location:type==='Incoming'?item.location:null,
      performed_by:user.username,
      notes:`${type} inventory update from LineFlow Live Inventory`,
      created_at:new Date().toISOString()
    });
    await syncReservations();
    setSavingId(null);
    setMovementQty(current=>({...current,[item.id]:1}));
    setMessage(movementError?`${type} count updated, but movement history could not be recorded.`:`${type} ${qty} ${item.material_name}. Reservations recalculated automatically.`);
    await load();
  }

  if(!canManage)return null;

  return <section className="sectionBlock" id="live-inventory">
    <div className="requestFlowHeader"><div>
      <p className="eyebrow">Live Inventory</p>
      <h2>Material Stock, Reservations & Movement</h2>
      <p className="dashboardRole">LineFlow automatically reserves available stock for open material requests. Reserved quantities cannot be manually assigned elsewhere, helping Recovery AI avoid counting the same material for multiple machines.</p>
    </div></div>

    {message&&<p className="requestMessage">{message}</p>}

    <div className="dashboardGrid supervisorCoreGrid">
      <article className="metricCard"><span>Inventory Items</span><strong>{loading?'—':totals.items}</strong><p>Tracked material records.</p></article>
      <article className="metricCard"><span>Available Units</span><strong>{loading?'—':totals.available}</strong><p>On hand minus reserved.</p></article>
      <article className="metricCard"><span>Reserved Units</span><strong>{loading?'—':totals.reserved}</strong><p>Automatically protected for active requests.</p></article>
      <article className="metricCard"><span>Low Stock</span><strong>{loading?'—':totals.low}</strong><p>Items at or below threshold after reservations.</p></article>
      <article className="metricCard"><span>In Transit</span><strong>{loading?'—':totals.incoming}</strong><p>Material expected to arrive.</p></article>
    </div>

    {!isTristen&&<div className="modelSetupFilters" style={{marginTop:12}}><label>Material Type
      <select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Boom</option><option>Hood</option></select>
    </label></div>}

    <div className="modelPartsTableWrap">
      <table className="modelPartsTable">
        <thead><tr><th>Material</th><th>Part #</th><th>Type</th><th>Location</th><th>On Hand</th><th>Reserved</th><th>Available</th><th>In Transit</th><th>Low At</th><th>Move Qty</th><th>Actions</th></tr></thead>
        <tbody>
          {loading?<tr><td colSpan={11}>Loading live inventory...</td></tr>:visible.length===0?<tr><td colSpan={11}>No inventory has been entered yet.</td></tr>:visible.map(item=>{
            const available=Math.max(0,item.on_hand-item.reserved);
            const low=available<=item.low_stock_threshold;
            return <tr key={item.id}>
              <td><input value={item.material_name} onChange={e=>updateLocal(item.id,'material_name',e.target.value)}/>{low&&<small className="cardAction"> Low stock</small>}</td>
              <td><input value={item.part_number??''} onChange={e=>updateLocal(item.id,'part_number',e.target.value)} placeholder="Part number"/></td>
              <td>{isTristen?<span>Hood</span>:<select value={item.material_type} onChange={e=>updateLocal(item.id,'material_type',e.target.value)}><option>Boom</option><option>Hood</option></select>}</td>
              <td><input list="inventory-location-options" value={item.location} onChange={e=>updateLocal(item.id,'location',e.target.value)}/></td>
              <td><input type="number" min="0" value={item.on_hand} onChange={e=>updateLocal(item.id,'on_hand',Number(e.target.value)||0)}/></td>
              <td><strong>{item.reserved}</strong><small className="cardAction"> Auto</small></td>
              <td><strong>{available}</strong></td>
              <td><input type="number" min="0" value={item.in_transit} onChange={e=>updateLocal(item.id,'in_transit',Number(e.target.value)||0)}/></td>
              <td><input type="number" min="0" value={item.low_stock_threshold} onChange={e=>updateLocal(item.id,'low_stock_threshold',Number(e.target.value)||0)}/></td>
              <td><input type="number" min="1" value={movementQty[item.id]??1} onChange={e=>setMovementQty(current=>({...current,[item.id]:Math.max(1,Number(e.target.value)||1)}))}/></td>
              <td className="modelPartActions">
                <button className="secondaryButton" disabled={savingId===item.id} onClick={()=>recordMovement(item,'Incoming')}>+ Incoming</button>
                <button className="secondaryButton" disabled={savingId===item.id||available===0} onClick={()=>recordMovement(item,'Outgoing')}>− Outgoing</button>
                <button className="secondaryButton" disabled={savingId===item.id} onClick={()=>saveItem(item)}>{savingId===item.id?'Saving...':'Save'}</button>
              </td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>

    <datalist id="inventory-location-options">{locations.map(value=><option key={value} value={value}/>)}</datalist>

    <form className="addModelPartForm" onSubmit={addItem}>
      <div><p className="eyebrow">Add Inventory</p><h3>Add a material record</h3></div>
      <div className="requestFormGrid">
        <label>Material Name<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Example: Base Boom"/></label>
        <label>Part Number<input value={partNumber} onChange={e=>setPartNumber(e.target.value)} placeholder="Part number"/></label>
        {!isTristen&&<label>Material Type<select value={materialType} onChange={e=>setMaterialType(e.target.value)}><option>Boom</option><option>Hood</option></select></label>}
        <label>Location<input required list="inventory-location-options" value={location} onChange={e=>setLocation(e.target.value)} placeholder="Storage location"/></label>
        <label>On Hand<input type="number" min="0" value={onHand} onChange={e=>setOnHand(Math.max(0,Number(e.target.value)||0))}/></label>
        <label>Low Stock Threshold<input type="number" min="0" value={threshold} onChange={e=>setThreshold(Math.max(0,Number(e.target.value)||0))}/></label>
      </div>
      <button className="primaryButton" type="submit">Add to Live Inventory</button>
    </form>
  </section>;
}

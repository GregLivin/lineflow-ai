'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type InventoryItem = {
  id:string;
  material_type:string;
  material_name:string;
  part_number:string|null;
  location:string;
  on_hand:number;
  reserved:number;
  low_stock_threshold:number;
};

export default function GregInventoryCheck(){
  const [items,setItems]=useState<InventoryItem[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');

  async function load(){
    const {data,error}=await supabase.from('inventory').select('id, material_type, material_name, part_number, location, on_hand, reserved, low_stock_threshold').eq('material_type','Boom').order('material_name');
    setItems((data??[]) as InventoryItem[]);
    setError(error?'Unable to load the inventory check.':'');
    setLoading(false);
  }

  useEffect(()=>{
    load();
    const channel=supabase.channel('greg-inventory-check').on('postgres_changes',{event:'*',schema:'public',table:'inventory'},load).subscribe();
    return()=>{supabase.removeChannel(channel)};
  },[]);

  const summary=useMemo(()=>({
    items:items.length,
    units:items.reduce((sum,item)=>sum+Math.max(0,item.on_hand),0),
    low:items.filter(item=>item.on_hand>0&&item.on_hand<=item.low_stock_threshold).length,
    out:items.filter(item=>item.on_hand<=0).length
  }),[items]);

  return <section className="sectionBlock" id="greg-inventory-check">
    <div className="requestFlowHeader"><div>
      <p className="eyebrow">Inventory Check</p>
      <h2>Boom Material Stock</h2>
      <p className="dashboardRole">Quick read-only view of what boom material is in stock and where to pick it up.</p>
    </div></div>

    <div className="dashboardGrid supervisorCoreGrid">
      <article className="metricCard"><span>Materials</span><strong>{loading?'—':summary.items}</strong><p>Boom material records.</p></article>
      <article className="metricCard"><span>Units In Stock</span><strong>{loading?'—':summary.units}</strong><p>Current on-hand units.</p></article>
      <article className="metricCard"><span>Low Stock</span><strong>{loading?'—':summary.low}</strong><p>At or below stock threshold.</p></article>
      <article className="metricCard"><span>Out of Stock</span><strong>{loading?'—':summary.out}</strong><p>No units currently on hand.</p></article>
    </div>

    {error&&<p className="requestMessage">{error}</p>}
    <div className="modelPartsTableWrap" style={{marginTop:14}}>
      <table className="modelPartsTable">
        <thead><tr><th>Material</th><th>Part #</th><th>Location</th><th>In Stock</th><th>Status</th></tr></thead>
        <tbody>
          {loading?<tr><td colSpan={5}>Loading boom inventory...</td></tr>:items.length===0?<tr><td colSpan={5}>No boom inventory has been entered yet.</td></tr>:items.map(item=>{
            const out=item.on_hand<=0;
            const low=!out&&item.on_hand<=item.low_stock_threshold;
            const status=out?'Out of Stock':low?'Low Stock':'In Stock';
            return <tr key={item.id}>
              <td><strong>{item.material_name}</strong></td>
              <td>{item.part_number||'—'}</td>
              <td><strong>{item.location||'—'}</strong></td>
              <td><strong style={{fontSize:'1.15rem'}}>{item.on_hand}</strong></td>
              <td><span className={`priorityBadge ${out?'priorityUrgent':''}`}>{status}</span></td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
    <p className="scheduleFootnote">Read only for Greg. Stock counts and locations update from LineFlow inventory data.</p>
  </section>;
}

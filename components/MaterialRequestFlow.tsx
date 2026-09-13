'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type DemoUser = { name: string; role: string; username: string };
type RequestPart = { id:string; request_id:string; part_name:string; part_number:string|null; quantity:number; location:string|null; delivered:boolean; delivered_at:string|null; delivered_by:string|null };
type MaterialRequest = { id:string; assembly_line:string; material_type:'Boom'|'Hood'; material_name:string; model:string|null; machine_id:string|null; machine_serial:string|null; job:string|null; quantity:number; priority:'Normal'|'Urgent'; assigned_handler:string|null; status:'Requested'|'Accepted'|'Picked Up'|'In Transit'|'Delivered'|'Confirmed'; requested_at:string; accepted_at:string|null; picked_up_at:string|null; in_transit_at:string|null; delivered_at:string|null; confirmed_at:string|null; notes:string|null; request_parts?:RequestPart[] };
type ModelPart = { model:string; material_type:string; part_name:string; part_number:string|null; quantity:number; location:string|null };
type MachineRun = { id:string; model:string; serial:string|null; job:string|null; status:string|null };

const starterModels = ['600S','800S','1200SJP','1500SJ'];
const timeLabel = (v:string|null) => v ? new Date(v).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}) : '—';
function elapsed(from:string,to?:string|null){ const end=to?new Date(to).getTime():Date.now(); const d=Math.max(0,end-new Date(from).getTime()); const m=Math.floor(d/60000),s=Math.floor((d%60000)/1000); return m?`${m}m ${s}s`:`${s}s`; }

export default function MaterialRequestFlow({user}:{user:DemoUser}){
  const [requests,setRequests]=useState<MaterialRequest[]>([]);
  const [availableModels,setAvailableModels]=useState(starterModels);
  const [availableParts,setAvailableParts]=useState<ModelPart[]>([]);
  const [machines,setMachines]=useState<MachineRun[]>([]);
  const [loading,setLoading]=useState(true);
  const [submitting,setSubmitting]=useState(false);
  const [message,setMessage]=useState('');
  const [materialType,setMaterialType]=useState<'Boom'|'Hood'>('Boom');
  const [model,setModel]=useState('1500SJ');
  const [selectedMachineId,setSelectedMachineId]=useState('');
  const [selectedPart,setSelectedPart]=useState('ALL');
  const [priority,setPriority]=useState<'Normal'|'Urgent'>('Normal');
  const [notes,setNotes]=useState('');

  const isLine=user.username.startsWith('line'), isGreg=user.username==='greg', isTristen=user.username==='tristen';
  const isLeadership=['tammy','chance','debbie','jose'].includes(user.username);
  const handler=isGreg?'greg':isTristen?'tristen':null;
  const lineName=isLine?`Line ${user.username.replace('line','')}`:null;

  async function loadModels(type:'Boom'|'Hood'=materialType){
    const {data}=await supabase.from('model_parts').select('model').eq('material_type',type).eq('active',true);
    const configured=(data??[]).map(r=>r.model as string);
    const next=Array.from(new Set([...starterModels,...configured])).sort();
    setAvailableModels(next); if(!next.includes(model)) setModel(next[0]??'1200SJP');
  }

  async function loadMachines(nextModel:string=model){
    const {data}=await supabase.from('machine_runs').select('id, model, serial, job, status').eq('model',nextModel).order('created_at',{ascending:false});
    setMachines((data??[]) as MachineRun[]);
    setSelectedMachineId('');
  }

  async function loadParts(nextModel:string=model, nextType:'Boom'|'Hood'=materialType){
    const {data}=await supabase.from('model_parts').select('model, material_type, part_name, part_number, quantity, location').eq('model',nextModel).eq('material_type',nextType).eq('active',true).order('part_name');
    setAvailableParts((data??[]) as ModelPart[]);
    setSelectedPart('ALL');
  }

  async function loadRequests(show=false){
    if(show)setLoading(true);
    let q=supabase.from('material_requests').select('*, request_parts(*)').order('requested_at',{ascending:false}).limit(100);
    if(lineName)q=q.eq('assembly_line',lineName); if(handler)q=q.eq('assigned_handler',handler);
    const {data,error}=await q; if(error)setMessage('Unable to load material requests.'); else setRequests((data??[]) as MaterialRequest[]); setLoading(false);
  }

  useEffect(()=>{
    loadRequests(true); loadModels(); loadParts(); loadMachines();
    const a=supabase.channel(`requests-${user.username}`).on('postgres_changes',{event:'*',schema:'public',table:'material_requests'},()=>loadRequests()).subscribe();
    const b=supabase.channel(`parts-${user.username}`).on('postgres_changes',{event:'*',schema:'public',table:'request_parts'},()=>loadRequests()).subscribe();
    const c=supabase.channel(`models-${user.username}`).on('postgres_changes',{event:'*',schema:'public',table:'model_parts'},()=>{loadModels();loadParts()}).subscribe();
    const d=supabase.channel(`machines-${user.username}`).on('postgres_changes',{event:'*',schema:'public',table:'machine_runs'},()=>loadMachines()).subscribe();
    const timer=window.setInterval(()=>setRequests(v=>[...v]),1000);
    return()=>{window.clearInterval(timer);supabase.removeChannel(a);supabase.removeChannel(b);supabase.removeChannel(c);supabase.removeChannel(d)};
  },[user.username]);

  async function chooseMaterialType(t:'Boom'|'Hood'){
    setMaterialType(t);
    await loadModels(t);
    await loadParts(model,t);
  }

  async function chooseModel(nextModel:string){
    setModel(nextModel);
    await Promise.all([loadParts(nextModel,materialType),loadMachines(nextModel)]);
  }

  async function submitRequest(e:FormEvent){
    e.preventDefault(); if(!lineName)return; setSubmitting(true);setMessage('');
    const assignedHandler=materialType==='Boom'?'greg':'tristen';
    const chosenPart=selectedPart==='ALL'?null:availableParts.find(p=>p.part_name===selectedPart)??null;
    const selectedMachine=machines.find(m=>m.id===selectedMachineId)??null;
    const requestLabel=chosenPart?`${model} · ${chosenPart.part_name}`:`${model} ${materialType} Material`;
    const {data:created,error}=await supabase.from('material_requests').insert({assembly_line:lineName,material_type:materialType,material_name:requestLabel,model,machine_id:selectedMachine?.id??null,machine_serial:selectedMachine?.serial??null,job:selectedMachine?.job??null,part_number:chosenPart?.part_number??null,quantity:1,priority,assigned_handler:assignedHandler,status:'Requested',notes:notes.trim()||null}).select('id').single();
    if(error||!created){setMessage('Request could not be sent. Please try again.');setSubmitting(false);return}

    const partsToRequest=chosenPart?[chosenPart]:availableParts;
    if(partsToRequest.length){
      await supabase.from('request_parts').insert(partsToRequest.map(p=>({request_id:created.id,part_name:p.part_name,part_number:p.part_number,quantity:p.quantity,location:p.location})));
    }

    setMessage(chosenPart
      ? `${chosenPart.part_name} for ${model}${selectedMachine?.serial?` · Serial ${selectedMachine.serial}`:''} sent to ${assignedHandler==='greg'?'Greg':'Tristen'}.`
      : partsToRequest.length
        ? `${model}${selectedMachine?.serial?` · Serial ${selectedMachine.serial}`:''} request sent to ${assignedHandler==='greg'?'Greg':'Tristen'} with ${partsToRequest.length} required part types.`
        : `${model} request sent. Its parts list still needs to be configured in LineFlow.`);
    setPriority('Normal');setNotes('');setSelectedPart('ALL');setSelectedMachineId('');await loadRequests();setSubmitting(false);
  }

  async function updateStatus(r:MaterialRequest,status:MaterialRequest['status']){
    const now=new Date().toISOString(), changes:Record<string,string>={status};
    if(status==='Accepted')changes.accepted_at=now;if(status==='Picked Up')changes.picked_up_at=now;if(status==='In Transit')changes.in_transit_at=now;if(status==='Delivered')changes.delivered_at=now;if(status==='Confirmed')changes.confirmed_at=now;
    const {error}=await supabase.from('material_requests').update(changes).eq('id',r.id); if(error)setMessage('Status could not be updated.');else await loadRequests();
  }

  async function togglePartDelivered(part:RequestPart){
    const delivered=!part.delivered; const {error}=await supabase.from('request_parts').update({delivered,delivered_at:delivered?new Date().toISOString():null,delivered_by:delivered?user.username:null}).eq('id',part.id);
    if(error)setMessage('Part delivery could not be updated.');else await loadRequests();
  }

  const newRequests=useMemo(()=>requests.filter(r=>r.status==='Requested'),[requests]);
  const activeRequests=useMemo(()=>requests.filter(r=>['Accepted','Picked Up','In Transit'].includes(r.status)),[requests]);
  const deliveredRequests=useMemo(()=>requests.filter(r=>['Delivered','Confirmed'].includes(r.status)),[requests]);

  function requestCard(r:MaterialRequest){
    const canHandle=(isGreg&&r.assigned_handler==='greg')||(isTristen&&r.assigned_handler==='tristen');
    const canConfirm=isLine&&r.assembly_line===lineName&&r.status==='Delivered'; const parts=r.request_parts??[]; const deliveredCount=parts.filter(p=>p.delivered).length; const allPartsDelivered=parts.length===0||deliveredCount===parts.length;
    return <article className={`requestCard ${r.priority==='Urgent'?'urgentRequest':''}`} key={r.id}>
      <div className="requestCardTop"><div><span className="requestLine">{r.assembly_line}</span><h3>{r.material_name}</h3></div><span className={`priorityBadge ${r.priority==='Urgent'?'priorityUrgent':''}`}>{r.priority}</span></div>
      <div className="requestMetaGrid"><div><span>Model</span><strong>{r.model||'—'}</strong></div><div><span>Machine</span><strong>{r.machine_serial||'Not assigned'}</strong></div><div><span>Job</span><strong>{r.job||'—'}</strong></div><div><span>Handler</span><strong>{r.assigned_handler==='greg'?'Greg':'Tristen'}</strong></div><div><span>Status</span><strong>{r.status}</strong></div></div>
      {parts.length>0?<div className="requestPartsList"><div className="requestPartsHeader"><strong>Required Parts</strong><span>{deliveredCount}/{parts.length} part types delivered</span></div>{parts.map(p=><label className={`requestPartRow ${p.delivered?'requestPartDelivered':''}`} key={p.id}><input type="checkbox" checked={p.delivered} readOnly={!canHandle} onChange={()=>canHandle&&togglePartDelivered(p)}/><span className="requestPartInfo"><strong>{p.part_name}</strong><small>Part #{p.part_number||'Not set'} · Qty {p.quantity} · {p.location||'Location not set'}</small></span></label>)}</div>:<p className="requestNotes">Parts list for this model has not been configured yet.</p>}
      {r.notes&&<p className="requestNotes">{r.notes}</p>}<div className="requestTiming"><span>Requested {timeLabel(r.requested_at)}</span><span>Elapsed {elapsed(r.requested_at,r.confirmed_at||r.delivered_at)}</span></div>
      {canHandle&&r.status==='Requested'&&<button className="primaryButton requestAction" onClick={()=>updateStatus(r,'Accepted')}>Accept Request</button>}
      {canHandle&&r.status==='Accepted'&&<button className="primaryButton requestAction" onClick={()=>updateStatus(r,'Picked Up')}>Mark Picked Up</button>}
      {canHandle&&r.status==='Picked Up'&&<button className="primaryButton requestAction" onClick={()=>updateStatus(r,'In Transit')}>Start Delivery / In Transit</button>}
      {canHandle&&r.status==='In Transit'&&<button className="primaryButton requestAction" disabled={!allPartsDelivered} onClick={()=>updateStatus(r,'Delivered')}>{allPartsDelivered?'Mark Request Delivered':'Check Off Every Part First'}</button>}
      {canConfirm&&<button className="primaryButton requestAction" onClick={()=>updateStatus(r,'Confirmed')}>Confirm Received</button>}
    </article>;
  }

  return <section className="sectionBlock requestFlowSection">
    <div className="requestFlowHeader"><div><p className="eyebrow">Live Material Flow</p><h2>{isLine?'Request Material by Model':isGreg?'Boom Request Queue':isTristen?'Hood Request Queue':'Material Request Control Board'}</h2><p className="dashboardRole">Request the complete model set or choose one individual part. When a production machine has a serial number, select it so LineFlow can build its material and completion history.</p></div><div className="liveRequestIndicator"><span className="statusDot"/> Realtime Connected</div></div>
    {message&&<p className="requestMessage">{message}</p>}
    {isLine&&<form className="requestForm" onSubmit={submitRequest}>
      <div className="requestTypeButtons"><button type="button" className={materialType==='Boom'?'typeButton activeTypeButton':'typeButton'} onClick={()=>chooseMaterialType('Boom')}>Boom</button><button type="button" className={materialType==='Hood'?'typeButton activeTypeButton':'typeButton'} onClick={()=>chooseMaterialType('Hood')}>Hood</button></div>
      <div className="requestFormGrid">
        <label>Model<select value={model} onChange={e=>chooseModel(e.target.value)}>{availableModels.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Machine / Serial<select value={selectedMachineId} onChange={e=>setSelectedMachineId(e.target.value)}><option value="">Not assigned / Serial not entered yet</option>{machines.map(m=><option key={m.id} value={m.id}>{m.serial||'No serial'}{m.job?` · Job ${m.job}`:''}{m.status?` · ${m.status}`:''}</option>)}</select></label>
        <label>Individual Part<select value={selectedPart} onChange={e=>setSelectedPart(e.target.value)}><option value="ALL">All Required Parts</option>{availableParts.map(p=><option key={`${p.part_name}-${p.part_number||''}`} value={p.part_name}>{p.part_name}{p.part_number?` · #${p.part_number}`:''}</option>)}</select></label>
        <label>Priority<select value={priority} onChange={e=>setPriority(e.target.value as 'Normal'|'Urgent')}><option>Normal</option><option>Urgent</option></select></label>
      </div>
      <label className="notesLabel">Notes<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional production note or special instruction"/></label>
      <div className="requestSubmitRow"><div><span>Destination</span><strong>{lineName}</strong></div><div><span>Routes To</span><strong>{materialType==='Boom'?'Greg · Combi Lift':'Tristen · Forklift'}</strong></div><button className="primaryButton" disabled={submitting}>{submitting?'Sending...':selectedPart==='ALL'?`Request ${model}`:`Request ${selectedPart}`}</button></div>
    </form>}
    {loading?<p className="dashboardRole">Loading live requests...</p>:<>{(isGreg||isTristen)&&<div className="requestColumns"><div><h3 className="queueTitle">Needs Action <span>{newRequests.length}</span></h3>{newRequests.length?newRequests.map(requestCard):<p className="emptyQueue">No new requests.</p>}</div><div><h3 className="queueTitle">Active <span>{activeRequests.length}</span></h3>{activeRequests.length?activeRequests.map(requestCard):<p className="emptyQueue">No active deliveries.</p>}</div><div><h3 className="queueTitle">Delivered Today <span>{deliveredRequests.length}</span></h3>{deliveredRequests.length?deliveredRequests.map(requestCard):<p className="emptyQueue">No completed deliveries yet.</p>}</div></div>}{isLine&&<div className="lineRequestList"><h3 className="queueTitle">Your Requests <span>{requests.length}</span></h3>{requests.length?requests.map(requestCard):<p className="emptyQueue">No requests yet. Send the first request above.</p>}</div>}{isLeadership&&<div className="lineRequestList"><h3 className="queueTitle">All Live Requests <span>{requests.length}</span></h3>{requests.length?requests.map(requestCard):<p className="emptyQueue">No material requests yet.</p>}</div>}</>}
  </section>;
}

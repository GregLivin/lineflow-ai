'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type ScheduleRow = { id:string; priority:number|null; job:string|null; model:string|null; serial:string|null; status:string|null; boom:string|null };
type ModelPart = { model:string; part_name:string; part_number:string|null; quantity:number; location:string|null };
type RequestPart = { id:string; part_name:string; part_number:string|null; quantity:number; delivered:boolean; reservation_status:string|null };
type RequestRow = { id:string; model:string|null; machine_serial:string|null; status:string; assigned_handler:string|null; request_parts?:RequestPart[] };

type ModelPlan = ScheduleRow & { required:ModelPart[]; requested:RequestPart[] };

function partKey(part:{part_name:string;part_number?:string|null}) { return `${part.part_name}|${part.part_number ?? ''}`; }

export default function BoomDeliveryPlan() {
  const [schedule,setSchedule]=useState<ScheduleRow[]>([]);
  const [parts,setParts]=useState<ModelPart[]>([]);
  const [requests,setRequests]=useState<RequestRow[]>([]);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState('');

  async function load() {
    const [scheduleResult,partsResult,requestResult] = await Promise.all([
      supabase.from('production_schedule').select('id, priority, job, model, serial, status, boom').order('priority',{ascending:true}),
      supabase.from('model_parts').select('model, part_name, part_number, quantity, location').eq('material_type','Boom').eq('active',true).order('part_name'),
      supabase.from('material_requests').select('id, model, machine_serial, status, assigned_handler, request_parts(id, part_name, part_number, quantity, delivered, reservation_status)').eq('material_type','Boom').order('requested_at',{ascending:false})
    ]);
    if(scheduleResult.error || partsResult.error || requestResult.error) setMessage('Unable to load the live boom delivery plan.');
    else {
      setSchedule((scheduleResult.data ?? []) as ScheduleRow[]);
      setParts((partsResult.data ?? []) as ModelPart[]);
      setRequests((requestResult.data ?? []) as RequestRow[]);
      setMessage('');
    }
    setLoading(false);
  }

  useEffect(()=>{
    load();
    const channel=supabase.channel('boom-delivery-plan')
      .on('postgres_changes',{event:'*',schema:'public',table:'production_schedule'},load)
      .on('postgres_changes',{event:'*',schema:'public',table:'material_requests'},load)
      .on('postgres_changes',{event:'*',schema:'public',table:'request_parts'},load)
      .on('postgres_changes',{event:'*',schema:'public',table:'model_parts'},load)
      .subscribe();
    return()=>{supabase.removeChannel(channel)};
  },[]);

  const plans=useMemo<ModelPlan[]>(()=>schedule.filter(row=>!!row.model).map(row=>{
    const required=parts.filter(part=>part.model===row.model);
    const matching=requests.filter(request=>request.model===row.model && (!row.serial || !request.machine_serial || request.machine_serial===row.serial));
    const latestByPart=new Map<string,RequestPart>();
    for(const request of matching) for(const part of request.request_parts ?? []) if(!latestByPart.has(partKey(part))) latestByPart.set(partKey(part),part);
    return {...row,required,requested:Array.from(latestByPart.values())};
  }),[schedule,parts,requests]);

  const totals=useMemo(()=>plans.reduce((acc,plan)=>{
    const delivered=plan.required.filter(p=>plan.requested.find(r=>partKey(r)===partKey(p))?.delivered).length;
    acc.required+=plan.required.length; acc.delivered+=delivered; return acc;
  },{required:0,delivered:0}),[plans]);
  const remaining=Math.max(0,totals.required-totals.delivered);
  const overall=totals.required?Math.round((totals.delivered/totals.required)*100):0;

  return <section className="sectionBlock boomDeliveryPlan">
    <div className="scheduleHeader"><div><p className="eyebrow">Visual Material Readiness</p><h2>Today&apos;s Boom Delivery Plan</h2><p className="dashboardRole">Required boom parts for each model in today&apos;s production schedule, matched to live delivery activity.</p></div></div>
    <div className="dashboardGrid">
      <div className="metricCard"><span>Models Today</span><strong>{plans.length}</strong><p>Scheduled boom models</p></div>
      <div className="metricCard"><span>Parts Delivered</span><strong>{totals.delivered}</strong><p>Required part types delivered</p></div>
      <div className="metricCard"><span>Parts Remaining</span><strong>{remaining}</strong><p>Required part types still needed</p></div>
      <div className="metricCard"><span>Overall Progress</span><strong>{overall}%</strong><p>Material delivery readiness</p></div>
    </div>
    {message&&<p className="requestMessage">{message}</p>}
    {loading?<p className="scheduleFootnote">Loading live boom delivery plan...</p>:plans.length===0?<p className="scheduleFootnote">Add models to today&apos;s production schedule to build the delivery plan.</p>:<div className="boomPlanList">{plans.map(plan=>{
      const delivered=plan.required.filter(p=>plan.requested.find(r=>partKey(r)===partKey(p))?.delivered).length;
      const percent=plan.required.length?Math.round(delivered/plan.required.length*100):0;
      return <article className="requestCard" key={plan.id}>
        <div className="requestCardTop"><div><span className="requestLine">Priority {plan.priority ?? '—'}</span><h3>{plan.model}</h3><p className="dashboardRole">Serial {plan.serial || 'Not entered'} · {plan.status || 'Planned'}</p></div><span className="priorityBadge">{delivered}/{plan.required.length} Delivered · {percent}%</span></div>
        {plan.required.length===0?<p className="requestNotes">No boom parts have been configured for this model yet.</p>:<div className="requestPartsList">{plan.required.map(part=>{
          const activity=plan.requested.find(r=>partKey(r)===partKey(part));
          const deliveredNow=!!activity?.delivered;
          const shortage=!deliveredNow && ['Short','No Inventory Match'].includes(activity?.reservation_status ?? '');
          const state=deliveredNow?'Delivered':shortage?'Not in Stock':'Pending';
          return <div className={`requestPartRow ${deliveredNow?'requestPartDelivered':''}`} key={partKey(part)}><span className="requestPartInfo"><strong>{part.part_name}</strong><small>Part #{part.part_number || 'Not set'} · Qty {part.quantity} · {part.location || 'Location not set'}</small></span><span className={`priorityBadge ${shortage?'priorityUrgent':''}`}>{state}</span></div>;
        })}</div>}
        <div className="requestTiming"><span>Next needed: {plan.required.filter(p=>!plan.requested.find(r=>partKey(r)===partKey(p))?.delivered).slice(0,3).map(p=>p.part_name).join(' · ') || 'All required parts delivered'}</span><span>Greg / Jose boom delivery workflow</span></div>
      </article>;
    })}</div>}
    <p className="scheduleFootnote">Green = delivered. Pending = still needed. Not in Stock = request activity indicates a live inventory shortage. No mock counts are generated here.</p>
  </section>;
}

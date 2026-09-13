'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type Machine = {
  id:string;
  model:string;
  serial:string|null;
  status:string|null;
  started_at:string|null;
  completed_at:string|null;
  green_tag_at:string|null;
};

type Request = {
  id:string;
  machine_id:string|null;
  requested_at:string;
  delivered_at:string|null;
  status:string;
};

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

type ModelPart = {
  id:string;
  model:string;
  material_type:string;
  part_name:string;
  part_number:string|null;
  quantity:number;
  active:boolean;
};

function durationLabel(ms:number|null){
  if(ms===null || ms<0) return 'Collecting data';
  const minutes=Math.round(ms/60000), h=Math.floor(minutes/60), m=minutes%60;
  return h?`${h}h ${m}m`:`${m}m`;
}

function norm(value:string|null|undefined){
  return (value??'').trim().toLowerCase();
}

export default function ProductionIntelligence(){
  const [machines,setMachines]=useState<Machine[]>([]);
  const [requests,setRequests]=useState<Request[]>([]);
  const [inventory,setInventory]=useState<InventoryItem[]>([]);
  const [modelParts,setModelParts]=useState<ModelPart[]>([]);
  const [loading,setLoading]=useState(true);

  async function load(){
    const [{data:machineData},{data:requestData},{data:inventoryData},{data:modelPartData}] = await Promise.all([
      supabase.from('machine_runs').select('id,model,serial,status,started_at,completed_at,green_tag_at').order('created_at',{ascending:false}),
      supabase.from('material_requests').select('id,machine_id,requested_at,delivered_at,status').not('machine_id','is',null).order('requested_at',{ascending:false}),
      supabase.from('inventory').select('id,material_type,material_name,part_number,location,on_hand,reserved,in_transit,low_stock_threshold,updated_at').order('updated_at',{ascending:false}),
      supabase.from('model_parts').select('id,model,material_type,part_name,part_number,quantity,active').eq('active',true).order('model')
    ]);
    setMachines((machineData??[]) as Machine[]);
    setRequests((requestData??[]) as Request[]);
    setInventory((inventoryData??[]) as InventoryItem[]);
    setModelParts((modelPartData??[]) as ModelPart[]);
    setLoading(false);
  }

  useEffect(()=>{
    load();
    const channels = [
      supabase.channel('recovery-ai-machines').on('postgres_changes',{event:'*',schema:'public',table:'machine_runs'},load).subscribe(),
      supabase.channel('recovery-ai-requests').on('postgres_changes',{event:'*',schema:'public',table:'material_requests'},load).subscribe(),
      supabase.channel('recovery-ai-inventory').on('postgres_changes',{event:'*',schema:'public',table:'inventory'},load).subscribe(),
      supabase.channel('recovery-ai-model-parts').on('postgres_changes',{event:'*',schema:'public',table:'model_parts'},load).subscribe()
    ];
    return()=>{channels.forEach(channel=>supabase.removeChannel(channel));};
  },[]);

  const intelligence=useMemo(()=>{
    const today=new Date();
    const sameDay=(value:string|null)=>{
      if(!value)return false;
      const d=new Date(value);
      return d.getFullYear()===today.getFullYear()&&d.getMonth()===today.getMonth()&&d.getDate()===today.getDate();
    };

    const completed=machines.filter(m=>sameDay(m.completed_at||m.green_tag_at));
    const backlog=machines.filter(m=>!m.completed_at&&!m.green_tag_at);
    const durations=completed
      .filter(m=>m.started_at&&(m.completed_at||m.green_tag_at))
      .map(m=>new Date((m.completed_at||m.green_tag_at)!).getTime()-new Date(m.started_at!).getTime())
      .filter(v=>v>=0);
    const avg=durations.length?durations.reduce((a,b)=>a+b,0)/durations.length:null;
    const waits=requests
      .filter(r=>r.machine_id&&r.delivered_at)
      .map(r=>new Date(r.delivered_at!).getTime()-new Date(r.requested_at).getTime())
      .filter(v=>v>=0);
    const avgWait=waits.length?waits.reduce((a,b)=>a+b,0)/waits.length:null;
    const delayed=backlog.filter(m=>['waiting on material','delayed','hold'].includes(norm(m.status))).length;

    const inventoryAvailable=(part:ModelPart)=>{
      const matches=inventory.filter(item=>{
        if(norm(item.material_type)!==norm(part.material_type)) return false;
        if(part.part_number && item.part_number) return norm(item.part_number)===norm(part.part_number);
        return norm(item.material_name)===norm(part.part_name);
      });
      return matches.reduce((sum,item)=>sum+Math.max(0,item.on_hand-item.reserved),0);
    };

    let ready=0, blocked=0, needsSetup=0;
    for(const machine of backlog){
      const requirements=modelParts.filter(part=>norm(part.model)===norm(machine.model));
      if(requirements.length===0){ needsSetup++; continue; }
      const isReady=requirements.every(part=>inventoryAvailable(part)>=Math.max(1,part.quantity));
      if(isReady) ready++; else blocked++;
    }

    const lowStock=inventory.filter(item=>Math.max(0,item.on_hand-item.reserved)<=item.low_stock_threshold).length;
    const inventoryUnits=inventory.reduce((sum,item)=>sum+Math.max(0,item.on_hand-item.reserved),0);

    return {
      completed:completed.length,
      backlog:backlog.length,
      avg,
      avgWait,
      delayed,
      ready,
      blocked,
      needsSetup,
      lowStock,
      inventoryUnits,
      inventoryRows:inventory.length
    };
  },[machines,requests,inventory,modelParts]);

  return <section className="sectionBlock">
    <div className="sectionHeading"><div>
      <p className="eyebrow">LineFlow Recovery AI</p>
      <h2>Reconditioning Production Intelligence</h2>
      <p className="dashboardRole">Analyzes machine progress, live inventory, material deliveries, completion times, and delays to identify the best opportunities to reduce the reconditioning backlog.</p>
    </div></div>

    <div className="dashboardGrid supervisorCoreGrid">
      <article className="metricCard"><span>Reconditioning Backlog</span><strong>{loading?'—':intelligence.backlog}</strong><p>Machines still needing completion.</p></article>
      <article className="metricCard"><span>Completed Today</span><strong>{loading?'—':intelligence.completed}</strong><p>Machines completed or green tagged today.</p></article>
      <article className="metricCard"><span>Avg. Completion Time</span><strong>{loading?'—':durationLabel(intelligence.avg)}</strong><p>Average machine start-to-completion time.</p></article>
      <article className="metricCard"><span>Avg. Material Wait</span><strong>{loading?'—':durationLabel(intelligence.avgWait)}</strong><p>Average request-to-delivery time for machine-linked material.</p></article>
      <article className="metricCard"><span>At Risk / Delayed</span><strong>{loading?'—':intelligence.delayed}</strong><p>Machines delayed, on hold, or waiting on material.</p></article>
    </div>

    <div className="dashboardToolPanel" style={{marginTop:12}}>
      <p className="eyebrow">Live Inventory Readiness</p>
      <h3>Use current stock to choose the next machines to finish</h3>
      <p className="dashboardRole">Recovery AI compares each open machine's configured model parts against live available inventory. Available inventory is calculated as on-hand minus reserved stock.</p>
      <div className="dashboardGrid supervisorCoreGrid" style={{marginTop:12}}>
        <article className="metricCard"><span>Inventory-Ready Machines</span><strong>{loading?'—':intelligence.ready}</strong><p>Open machines whose configured material requirements are currently available.</p></article>
        <article className="metricCard"><span>Blocked by Stock</span><strong>{loading?'—':intelligence.blocked}</strong><p>Machines with at least one configured material shortage.</p></article>
        <article className="metricCard"><span>Low-Stock Items</span><strong>{loading?'—':intelligence.lowStock}</strong><p>Inventory at or below its configured low-stock threshold.</p></article>
        <article className="metricCard"><span>Available Units</span><strong>{loading?'—':intelligence.inventoryUnits}</strong><p>Total available pieces across live inventory after reservations.</p></article>
      </div>
      {!loading&&intelligence.inventoryRows===0&&<p className="requestMessage">Live inventory is connected, but no inventory records have been entered yet. Recovery recommendations will begin as on-hand stock is added.</p>}
      {!loading&&intelligence.needsSetup>0&&<p className="requestMessage">{intelligence.needsSetup} open machine{intelligence.needsSetup===1?'':'s'} cannot be scored yet because required model parts have not been configured.</p>}
    </div>

    <div className="dashboardToolPanel" style={{marginTop:12}}>
      <p className="eyebrow">What Recovery AI Is Learning</p>
      <h3>Find the bottlenecks preventing us from catching up</h3>
      <p className="dashboardRole">As serial-linked production and inventory history grows, Recovery AI will identify which machines take longest, which materials cause the most waiting, recurring shortages, and which inventory-ready machines are the strongest candidates to complete next.</p>
    </div>

    <div className="dashboardToolPanel" style={{marginTop:12}}>
      <p className="eyebrow">Recovery Focus</p>
      <h3>{intelligence.backlog===0?'Build the production history':'Reduce the reconditioning backlog'}</h3>
      <p className="dashboardRole">Start with inventory-ready machines while material is staged for blocked machines. This creates a continuous recovery pipeline instead of waiting until a machine is already stopped for material.</p>
    </div>
  </section>;
}

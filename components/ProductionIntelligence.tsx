'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type Machine = { id:string; model:string|null; serial_number:string|null; status:string|null; started_at:string|null; completed_at:string|null; green_tag_at:string|null };
type Request = { id:string; machine_id:string|null; requested_at:string; delivered_at:string|null; status:string };

function durationLabel(ms:number|null){
  if(ms===null || ms<0) return 'Collecting data';
  const minutes=Math.round(ms/60000), h=Math.floor(minutes/60), m=minutes%60;
  return h?`${h}h ${m}m`:`${m}m`;
}

export default function ProductionIntelligence(){
  const [machines,setMachines]=useState<Machine[]>([]);
  const [requests,setRequests]=useState<Request[]>([]);
  const [loading,setLoading]=useState(true);

  async function load(){
    const [{data:machineData},{data:requestData}] = await Promise.all([
      supabase.from('machine_production_records').select('id,model,serial_number,status,started_at,completed_at,green_tag_at').order('created_at',{ascending:false}),
      supabase.from('material_requests').select('id,machine_id,requested_at,delivered_at,status').not('machine_id','is',null).order('requested_at',{ascending:false})
    ]);
    setMachines((machineData??[]) as Machine[]); setRequests((requestData??[]) as Request[]); setLoading(false);
  }

  useEffect(()=>{
    load();
    const a=supabase.channel('tammy-production-intelligence-machines').on('postgres_changes',{event:'*',schema:'public',table:'machine_production_records'},load).subscribe();
    const b=supabase.channel('tammy-production-intelligence-requests').on('postgres_changes',{event:'*',schema:'public',table:'material_requests'},load).subscribe();
    return()=>{supabase.removeChannel(a);supabase.removeChannel(b)};
  },[]);

  const stats=useMemo(()=>{
    const today=new Date();
    const sameDay=(value:string|null)=>{if(!value)return false;const d=new Date(value);return d.getFullYear()===today.getFullYear()&&d.getMonth()===today.getMonth()&&d.getDate()===today.getDate()};
    const completed=machines.filter(m=>sameDay(m.completed_at||m.green_tag_at));
    const backlog=machines.filter(m=>!m.completed_at&&!m.green_tag_at);
    const durations=completed.filter(m=>m.started_at&&(m.completed_at||m.green_tag_at)).map(m=>new Date((m.completed_at||m.green_tag_at)!).getTime()-new Date(m.started_at!).getTime()).filter(v=>v>=0);
    const avg=durations.length?durations.reduce((a,b)=>a+b,0)/durations.length:null;
    const waits=requests.filter(r=>r.machine_id&&r.delivered_at).map(r=>new Date(r.delivered_at!).getTime()-new Date(r.requested_at).getTime()).filter(v=>v>=0);
    const avgWait=waits.length?waits.reduce((a,b)=>a+b,0)/waits.length:null;
    const delayed=machines.filter(m=>!m.completed_at&&!m.green_tag_at&&['Waiting on Material','Delayed','Hold'].includes(m.status??'')).length;
    return {completed:completed.length,backlog:backlog.length,avg,avgWait,delayed};
  },[machines,requests]);

  return <section className="sectionBlock">
    <div className="sectionHeading"><div>
      <p className="eyebrow">LineFlow Recovery AI</p>
      <h2>Reconditioning Production Intelligence</h2>
      <p className="dashboardRole">Analyzes machine progress, material deliveries, completion times, and delays to identify opportunities to reduce the reconditioning backlog.</p>
    </div></div>

    <div className="dashboardGrid supervisorCoreGrid">
      <article className="metricCard"><span>Reconditioning Backlog</span><strong>{loading?'—':stats.backlog}</strong><p>Machines still needing completion.</p></article>
      <article className="metricCard"><span>Completed Today</span><strong>{loading?'—':stats.completed}</strong><p>Machines completed or green tagged today.</p></article>
      <article className="metricCard"><span>Avg. Completion Time</span><strong>{loading?'—':durationLabel(stats.avg)}</strong><p>Average machine start-to-completion time.</p></article>
      <article className="metricCard"><span>Avg. Material Wait</span><strong>{loading?'—':durationLabel(stats.avgWait)}</strong><p>Average request-to-delivery time for machine-linked material.</p></article>
      <article className="metricCard"><span>At Risk / Delayed</span><strong>{loading?'—':stats.delayed}</strong><p>Machines delayed, on hold, or waiting on material.</p></article>
    </div>

    <div className="dashboardToolPanel" style={{marginTop:12}}>
      <p className="eyebrow">What Recovery AI Is Learning</p>
      <h3>Find the bottlenecks preventing us from catching up</h3>
      <p className="dashboardRole">As serial-linked production history grows, Recovery AI will identify which machines take longest, which material requests create the most waiting time, recurring shortages, and where the team can recover production time. Predictive recommendations will activate after enough real production history is available.</p>
    </div>

    <div className="dashboardToolPanel" style={{marginTop:12}}>
      <p className="eyebrow">Recovery Focus</p>
      <h3>{stats.backlog===0?'Build the production history':'Reduce the reconditioning backlog'}</h3>
      <p className="dashboardRole">Use Recovery AI with the live production schedule to prioritize machines that are ready to finish, expose units blocked by material, and measure whether daily completion pace is improving.</p>
    </div>
  </section>;
}

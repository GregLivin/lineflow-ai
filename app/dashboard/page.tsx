'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MaterialRequestFlow from '../../components/MaterialRequestFlow';
import ModelPartsSetup from '../../components/ModelPartsSetup';
import ProductionSchedule from '../../components/ProductionSchedule';
import YardReconditioning from '../../components/YardReconditioning';
import TeamMessageBoard from '../../components/TeamMessageBoard';
import ProductionGoals from '../../components/ProductionGoals';

type UserGroup = 'line' | 'handler' | 'supervisor' | 'specialist';
type DemoUser = { name: string; role: string; username: string; group?: UserGroup };
type PanelKey = 'requests' | 'inventory' | 'yard' | 'goals' | 'schedule' | null;
type CardProps = { label:string; value:string; text:string; panel:Exclude<PanelKey,null>; onOpen:(panel:Exclude<PanelKey,null>)=>void };

function ClickCard({label,value,text,panel,onOpen}:CardProps){
  return <button className="metricCard metricCardButton" type="button" onClick={()=>onOpen(panel)}><span>{label}</span><strong>{value}</strong><p>{text}</p><small className="cardAction">Open →</small></button>;
}

function inferGroup(user:DemoUser):UserGroup{
  if(user.group)return user.group;
  if(user.username.startsWith('line'))return 'line';
  if(['greg','tristen'].includes(user.username))return 'handler';
  if(user.username==='jose')return 'specialist';
  return 'supervisor';
}

export default function DashboardPage(){
  const router=useRouter();
  const [user,setUser]=useState<DemoUser|null>(null);
  const [activePanel,setActivePanel]=useState<PanelKey>(null);

  useEffect(()=>{
    const saved=localStorage.getItem('lineflowUser');
    if(!saved){router.replace('/login');return;}
    try{setUser(JSON.parse(saved));}catch{localStorage.removeItem('lineflowUser');router.replace('/login');}
  },[router]);

  function signOut(){localStorage.removeItem('lineflowUser');router.push('/login');}
  function jumpTo(id:string){document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});}
  function openPanel(panel:Exclude<PanelKey,null>){
    setActivePanel(panel);
    window.setTimeout(()=>{
      if(panel==='inventory') jumpTo('parts');
      else if(panel==='yard') jumpTo('yard-reconditioning');
      else if(panel==='goals') jumpTo('production-goals');
      else if(panel==='requests') jumpTo('requests');
      else document.getElementById('dashboard-tool-panel')?.scrollIntoView({behavior:'smooth',block:'start'});
    },0);
  }

  if(!user)return <main className="shell"><p>Loading LineFlow AI...</p></main>;

  const group=inferGroup(user);
  const isLine=group==='line';
  const isHandler=group==='handler';
  const isSupervisor=group==='supervisor';
  const isSpecialist=group==='specialist';
  const isGreg=user.username==='greg';
  const isTristen=user.username==='tristen';
  const canViewParts=!isLine;
  const canViewSchedule=!isLine;
  const canViewYard=isSupervisor||isSpecialist;
  const canViewGoals=isSupervisor||isSpecialist;

  const accessTitle=isLine?'Line User View':isHandler?'Material Handler View':isSpecialist?'Boom Line Material Specialist View':'Supervisor / Planner View';
  const accessText=isLine?'Create material requests, track status, and confirm delivery.':isHandler?'Receive assigned requests, check parts, and update delivery status.':isSpecialist?'Monitor boom-line readiness, parts, schedule, shortages, and production support.':'Monitor production, material flow, inventory, yard reconditioning, and daily goals.';

  return <main className="shell">
    <section className="dashboardHeader">
      <div><p className="eyebrow">LineFlow AI Dashboard</p><h1 className="dashboardTitle">Welcome, {user.name}</h1><p className="dashboardRole">{user.role}</p></div>
      <button className="secondaryButton" onClick={signOut}>Sign Out</button>
    </section>

    {isSupervisor ? <>
      <TeamMessageBoard user={user}/>
      <section className="dashboardGrid supervisorCoreGrid">
        <ClickCard label="Material Requests" value="Lines 1–4" text="Monitor open, urgent, active, delivered, and confirmed requests across production." panel="requests" onOpen={openPanel}/>
        <ClickCard label="Inventory" value="Parts & Stock" text="Review part numbers, locations, material readiness, shortages, and stock information." panel="inventory" onOpen={openPanel}/>
        <ClickCard label="Yard & Reconditioning" value="Boom Lifts" text="Track exact units in the yard, reconditioning status, waiting on material, green tags, and completed units." panel="yard" onOpen={openPanel}/>
        <ClickCard label="Production Goals" value="Live Progress" text="Track today’s green tag target, completed units, remaining goal, waiting on material, and completion percentage." panel="goals" onOpen={openPanel}/>
      </section>
    </> : <>
      <section className="sectionBlock dashboardToolPanel"><p className="eyebrow">Your Access</p><h2>{accessTitle}</h2><p className="dashboardRole">{accessText}</p></section>
      {isLine&&<section className="dashboardGrid"><ClickCard label="Request Material" value="Create Request" text="Select the model or material needed and send it." panel="requests" onOpen={openPanel}/><ClickCard label="Track Requests" value="Live Status" text="Track the request through delivery and confirmation." panel="requests" onOpen={openPanel}/></section>}
      {isHandler&&<section className="dashboardGrid"><ClickCard label="Assigned Requests" value={isGreg?'Boom Queue':isTristen?'Hood Queue':'My Queue'} text="Accept assigned material requests and work them in priority order." panel="requests" onOpen={openPanel}/><ClickCard label="Part Checklist" value="Pick & Deliver" text="See parts, quantities, part numbers, and locations." panel="requests" onOpen={openPanel}/><ClickCard label="Parts & Locations" value="Reference" text="Review material information before picking." panel="inventory" onOpen={openPanel}/><ClickCard label="Production Plan" value="Read Only" text="Review upcoming production demand." panel="schedule" onOpen={openPanel}/></section>}
      {isSpecialist&&<section className="dashboardGrid"><ClickCard label="Yard Boom Lifts" value="Reconditioning" text="See exact boom-lift backlog, completed green tags, and units waiting on material." panel="yard" onOpen={openPanel}/><ClickCard label="Production Goals" value="Live Progress" text="Track today’s green tag goal and units waiting on material." panel="goals" onOpen={openPanel}/><ClickCard label="Live Requests" value="Boom Support" text="Monitor boom delivery activity." panel="requests" onOpen={openPanel}/><ClickCard label="Model & Parts" value="Manage" text="Maintain boom part information." panel="inventory" onOpen={openPanel}/></section>}
    </>}

    {canViewGoals&&<ProductionGoals user={user}/>} 
    {canViewYard&&<YardReconditioning user={user}/>} 
    <div id="requests"><MaterialRequestFlow user={user}/></div>
    {canViewParts&&<div id="parts"><ModelPartsSetup user={user}/></div>}

    {activePanel==='schedule'&&canViewSchedule&&<section id="dashboard-tool-panel" className="sectionBlock dashboardToolPanel"><div className="toolPanelHeader"><div><p className="eyebrow">Production</p><h2>Production Schedule</h2></div><button className="secondaryButton" onClick={()=>setActivePanel(null)}>Close</button></div><ProductionSchedule/></section>}
  </main>;
}

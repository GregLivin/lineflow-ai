'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MaterialRequestFlow from '../../components/MaterialRequestFlow';
import ModelPartsSetup from '../../components/ModelPartsSetup';
import ProductionSchedule from '../../components/ProductionSchedule';
import BoomDeliveryPlan from '../../components/BoomDeliveryPlan';
import YardReconditioning from '../../components/YardReconditioning';
import TeamMessageBoard from '../../components/TeamMessageBoard';
import ProductionGoals from '../../components/ProductionGoals';
import ProductionIntelligence from '../../components/ProductionIntelligence';
import LiveInventory from '../../components/LiveInventory';

type UserGroup = 'line' | 'handler' | 'supervisor' | 'specialist' | 'shipping';
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
  if(user.username==='byrd')return 'shipping';
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
      if(panel==='inventory') jumpTo('live-inventory');
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
  const isShipping=group==='shipping';
  const isGreg=user.username==='greg';
  const isTristen=user.username==='tristen';
  const isTammy=user.username==='tammy';
  const canViewParts=!isLine&&!isShipping;
  const canViewSchedule=!isLine;
  const canViewYard=isSupervisor||isSpecialist||isShipping;
  const canViewGoals=isSupervisor||isSpecialist;
  const canViewBoomPlan=!isTristen&&!isShipping;

  const accessTitle=isLine?'Line User View':isHandler?'Material Handler View':isSpecialist?'Boom Line Material Specialist View':isShipping?'Shipping & Receiving View':'Supervisor / Planner View';
  const accessText=isLine?'Create material requests, track status, and confirm delivery.':isHandler?'Receive assigned requests, check parts, and update delivery status.':isSpecialist?'Monitor boom-line readiness, parts, schedule, shortages, and production support.':isShipping?'Check incoming models into reconditioning and completed models out for flatbed shipment.':'Monitor production, material flow, inventory, yard reconditioning, and daily goals.';

  const header = <section className="dashboardHeader"><div><p className="eyebrow">LineFlow AI Dashboard</p><h1 className="dashboardTitle">Welcome, {user.name}</h1><p className="dashboardRole">{user.role}</p></div><button className="secondaryButton" onClick={signOut}>Sign Out</button></section>;

  if(isTammy){return <main className="shell">{header}<TeamMessageBoard user={user}/><ProductionSchedule/><BoomDeliveryPlan/><ProductionIntelligence/><LiveInventory user={user}/></main>;}

  return <main className="shell">
    {header}
    {isSupervisor ? <><TeamMessageBoard user={user}/><section className="dashboardGrid supervisorCoreGrid"><ClickCard label="Material Requests" value="Lines 1–4" text="Monitor open, urgent, active, delivered, and confirmed requests across production." panel="requests" onOpen={openPanel}/><ClickCard label="Inventory" value="Parts & Stock" text="Review and update live stock, part numbers, locations, shortages, and incoming material." panel="inventory" onOpen={openPanel}/><ClickCard label="Yard & Reconditioning" value="Boom Lifts" text="Track exact units in the yard, reconditioning status, waiting on material, green tags, and completed units." panel="yard" onOpen={openPanel}/><ClickCard label="Production Goals" value="Live Progress" text="Track today’s green tag target, completed units, remaining goal, waiting on material, and completion percentage." panel="goals" onOpen={openPanel}/></section></> : <>
      <section className="sectionBlock dashboardToolPanel"><p className="eyebrow">Your Access</p><h2>{accessTitle}</h2><p className="dashboardRole">{accessText}</p></section>
      {isLine&&<section className="dashboardGrid"><ClickCard label="Request Material" value="Create Request" text="Select the model or material needed and send it." panel="requests" onOpen={openPanel}/><ClickCard label="Track Requests" value="Live Status" text="Track the request through delivery and confirmation." panel="requests" onOpen={openPanel}/></section>}
      {isHandler&&<section className="dashboardGrid"><ClickCard label="Assigned Requests" value={isGreg?'Boom Queue':isTristen?'Hood Queue':'My Queue'} text="Accept assigned material requests and work them in priority order." panel="requests" onOpen={openPanel}/><ClickCard label="Part Checklist" value="Pick & Deliver" text="See parts, quantities, part numbers, and locations." panel="requests" onOpen={openPanel}/><ClickCard label="Live Inventory" value={isTristen?'Hood Stock':'Parts & Stock'} text="Update incoming, outgoing, reserved, and on-hand material." panel="inventory" onOpen={openPanel}/><ClickCard label="Production Plan" value="Read Only" text="Review upcoming production demand." panel="schedule" onOpen={openPanel}/></section>}
      {isSpecialist&&<section className="dashboardGrid"><ClickCard label="Yard Boom Lifts" value="Reconditioning" text="See exact boom-lift backlog, completed green tags, and units waiting on material." panel="yard" onOpen={openPanel}/><ClickCard label="Production Goals" value="Live Progress" text="Track today’s green tag goal and units waiting on material." panel="goals" onOpen={openPanel}/><ClickCard label="Live Requests" value="Boom Support" text="Monitor boom delivery activity." panel="requests" onOpen={openPanel}/><ClickCard label="Live Inventory" value="Boom Stock" text="Maintain boom inventory, movement, locations, and shortages." panel="inventory" onOpen={openPanel}/></section>}
      {isShipping&&<section className="dashboardGrid"><ClickCard label="Incoming Models" value="Check In" text="Record models arriving for reconditioning and review units currently in the yard." panel="yard" onOpen={openPanel}/><ClickCard label="Completed Models" value="Check Out" text="Review completed units ready to be loaded onto flatbed trucks for shipment." panel="yard" onOpen={openPanel}/><ClickCard label="Production Schedule" value="Read Only" text="Review model, serial, job, status, and shipping readiness." panel="schedule" onOpen={openPanel}/></section>}
    </>}
    {canViewBoomPlan&&<BoomDeliveryPlan/>}
    {canViewGoals&&<ProductionGoals user={user}/>} 
    {canViewYard&&<YardReconditioning user={user}/>} 
    {!isShipping&&<div id="requests"><MaterialRequestFlow user={user}/></div>}
    {canViewParts&&<LiveInventory user={user}/>} 
    {canViewParts&&<div id="parts"><ModelPartsSetup user={user}/></div>}
    {activePanel==='schedule'&&canViewSchedule&&<section id="dashboard-tool-panel" className="sectionBlock dashboardToolPanel"><div className="toolPanelHeader"><div><p className="eyebrow">Production</p><h2>Production Schedule</h2></div><button className="secondaryButton" onClick={()=>setActivePanel(null)}>Close</button></div><ProductionSchedule/><BoomDeliveryPlan/></section>}
  </main>;
}

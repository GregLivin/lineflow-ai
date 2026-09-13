'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MaterialRequestFlow from '../../components/MaterialRequestFlow';
import ModelPartsSetup from '../../components/ModelPartsSetup';
import ProductionSchedule from '../../components/ProductionSchedule';
import YardReconditioning from '../../components/YardReconditioning';

type UserGroup = 'line' | 'handler' | 'supervisor' | 'specialist';
type DemoUser = { name: string; role: string; username: string; group?: UserGroup };
type PanelKey = 'requests' | 'parts' | 'schedule' | 'inventory' | 'performance' | 'alerts' | 'workflow' | 'lines' | 'handoff' | null;
type CardProps = { label:string; value:string; text:string; panel:Exclude<PanelKey,null>; onOpen:(panel:Exclude<PanelKey,null>)=>void };

function ClickCard({label,value,text,panel,onOpen}:CardProps){return <button className="metricCard metricCardButton" type="button" onClick={()=>onOpen(panel)}><span>{label}</span><strong>{value}</strong><p>{text}</p><small className="cardAction">Open →</small></button>}
function inferGroup(user:DemoUser):UserGroup{if(user.group)return user.group;if(user.username.startsWith('line'))return 'line';if(['greg','tristen'].includes(user.username))return 'handler';if(user.username==='jose')return 'specialist';return 'supervisor'}

export default function DashboardPage(){
 const router=useRouter(); const [user,setUser]=useState<DemoUser|null>(null); const [activePanel,setActivePanel]=useState<PanelKey>(null);
 useEffect(()=>{const saved=localStorage.getItem('lineflowUser');if(!saved){router.replace('/login');return}try{setUser(JSON.parse(saved))}catch{localStorage.removeItem('lineflowUser');router.replace('/login')}},[router]);
 function signOut(){localStorage.removeItem('lineflowUser');router.push('/login')}
 function openPanel(panel:Exclude<PanelKey,null>){setActivePanel(panel);window.setTimeout(()=>document.getElementById(panel==='inventory'?'yard-reconditioning':'dashboard-tool-panel')?.scrollIntoView({behavior:'smooth',block:'start'}),0)}
 function jumpTo(id:string){document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'})}
 if(!user)return <main className="shell"><p>Loading LineFlow AI...</p></main>;
 const group=inferGroup(user),isLine=group==='line',isHandler=group==='handler',isSupervisor=group==='supervisor',isSpecialist=group==='specialist';
 const isGreg=user.username==='greg',isTristen=user.username==='tristen',isTammy=user.username==='tammy',isChance=user.username==='chance';
 const canViewParts=!isLine,canViewSchedule=!isLine,canViewAllLines=isSupervisor||isSpecialist,canViewYard=isSupervisor||isSpecialist;
 const accessTitle=isLine?'Line User View':isHandler?'Material Handler View':isSpecialist?'Boom Line Material Specialist View':'Supervisor / Planner View';
 const accessText=isLine?'Create material requests, track status, and confirm delivery.':isHandler?'Receive assigned requests, check parts, and update delivery status.':isSpecialist?'Monitor boom-line readiness, parts, schedule, shortages, and production support.':'Monitor all lines, production priorities, yard inventory, material flow, handlers, alerts, and operational controls.';
 return <main className="shell">
  <section className="dashboardHeader"><div><p className="eyebrow">LineFlow AI Dashboard</p><h1 className="dashboardTitle">Welcome, {user.name}</h1><p className="dashboardRole">{user.role}</p></div><div className="actions" style={{marginTop:0}}><button className="secondaryButton" onClick={signOut}>Sign Out</button></div></section>
  <section className="sectionBlock dashboardToolPanel"><p className="eyebrow">Your Access</p><h2>{accessTitle}</h2><p className="dashboardRole">{accessText}</p><div className="toolActions"><span className="statusStrip">✓ Live requests</span>{canViewParts&&<span className="statusStrip">✓ Parts & locations</span>}{canViewSchedule&&<span className="statusStrip">✓ Production schedule</span>}{canViewYard&&<span className="statusStrip">✓ Yard reconditioning</span>}{canViewAllLines&&<span className="statusStrip">✓ All-line visibility</span>}</div></section>
  {isLine&&<section className="dashboardGrid"><ClickCard label="Request Material" value="Create Request" text="Select the model or material needed and send it." panel="requests" onOpen={openPanel}/><ClickCard label="Track Requests" value="Live Status" text="Track the request through delivery and confirmation." panel="requests" onOpen={openPanel}/></section>}
  {isHandler&&<section className="dashboardGrid"><ClickCard label="Assigned Requests" value={isGreg?'Boom Queue':isTristen?'Hood Queue':'My Queue'} text="Accept assigned material requests and work them in priority order." panel="requests" onOpen={openPanel}/><ClickCard label="Part Checklist" value="Pick & Deliver" text="See parts, quantities, part numbers, and locations." panel="requests" onOpen={openPanel}/><ClickCard label="Parts & Locations" value="Reference" text="Review material information before picking." panel="parts" onOpen={openPanel}/><ClickCard label="Production Plan" value="Read Only" text="Review upcoming production demand." panel="schedule" onOpen={openPanel}/></section>}
  {isSpecialist&&<section className="dashboardGrid"><ClickCard label="Yard Boom Lifts" value="Reconditioning" text="See exact boom-lift backlog, completed green tags, and units waiting on material." panel="inventory" onOpen={openPanel}/><ClickCard label="Live Requests" value="Boom Support" text="Monitor boom delivery activity." panel="requests" onOpen={openPanel}/><ClickCard label="Model & Parts" value="Manage" text="Maintain boom part information." panel="parts" onOpen={openPanel}/><ClickCard label="Production Schedule" value="View & Update" text="Track schedule and readiness." panel="schedule" onOpen={openPanel}/></section>}
  {isSupervisor&&<>{isTammy&&<section className="sectionBlock"><p className="eyebrow">Remote Operations Leadership</p><h2>Houston Operations Overview</h2></section>}<section className="dashboardGrid"><ClickCard label="All Material Requests" value="Lines 1–4" text="Monitor material requests across production." panel="requests" onOpen={openPanel}/><ClickCard label="Production Plan" value="View & Update" text="Review priorities, targets, holds, and schedule changes." panel="schedule" onOpen={openPanel}/><ClickCard label="Yard Inventory" value="Boom Reconditioning" text="Exact count in yard, needs reconditioning, in progress, waiting on material, completed green tags, and ready to ship." panel="inventory" onOpen={openPanel}/><ClickCard label="Needs Attention" value={isChance?'Houston Floor':'Alerts'} text="Review production risks and workflow exceptions." panel="alerts" onOpen={openPanel}/><ClickCard label="Performance" value="Goals & Reports" text="Review progress toward the 3 green tags per day goal." panel="performance" onOpen={openPanel}/><ClickCard label="Shift Handoff" value="Open Items" text="Review incomplete work carrying into the next shift." panel="handoff" onOpen={openPanel}/></section></>}
  {canViewYard&&<YardReconditioning user={user}/>} 
  <div id="requests"><MaterialRequestFlow user={user}/></div>{canViewParts&&<div id="parts"><ModelPartsSetup user={user}/></div>}
  {activePanel&&activePanel!=='inventory'&&<section id="dashboard-tool-panel" className="sectionBlock dashboardToolPanel"><div className="toolPanelHeader"><div><p className="eyebrow">Interactive Tool</p><h2>{activePanel==='schedule'?'Production Schedule':activePanel==='requests'?'Live Material Requests':activePanel==='performance'?'Performance & Goals':'Operations Tool'}</h2></div><button className="secondaryButton" onClick={()=>setActivePanel(null)}>Close</button></div>{activePanel==='schedule'&&canViewSchedule?<ProductionSchedule/>:<div className="toolActions"><button className="primaryButton" onClick={()=>jumpTo('requests')}>Open Live Requests</button>{canViewParts&&<button className="secondaryButton" onClick={()=>jumpTo('parts')}>Open Model & Parts</button>}</div>}</section>}
 </main>;
}

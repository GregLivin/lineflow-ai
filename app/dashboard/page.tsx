'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MaterialRequestFlow from '../../components/MaterialRequestFlow';
import ModelPartsSetup from '../../components/ModelPartsSetup';
import ProductionSchedule from '../../components/ProductionSchedule';

type DemoUser = { name: string; role: string; username: string };
type PanelKey = 'requests' | 'parts' | 'schedule' | 'inventory' | 'performance' | 'alerts' | 'workflow' | 'audit' | 'lines' | 'handoff' | null;

type CardProps = {
  label: string;
  value: string;
  text: string;
  panel: Exclude<PanelKey, null>;
  onOpen: (panel: Exclude<PanelKey, null>) => void;
};

function ClickCard({ label, value, text, panel, onOpen }: CardProps) {
  return (
    <button className="metricCard metricCardButton" type="button" onClick={() => onOpen(panel)}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{text}</p>
      <small className="cardAction">Open →</small>
    </button>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<DemoUser | null>(null);
  const [activePanel, setActivePanel] = useState<PanelKey>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lineflowUser');
    if (!saved) { router.replace('/login'); return; }
    setUser(JSON.parse(saved));
  }, [router]);

  function signOut() { localStorage.removeItem('lineflowUser'); router.push('/login'); }
  function openPanel(panel: Exclude<PanelKey, null>) {
    setActivePanel(panel);
    window.setTimeout(() => document.getElementById('dashboard-tool-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }
  function jumpTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (!user) return <main className="shell"><p>Loading LineFlow AI...</p></main>;

  const isTammy = user.username === 'tammy';
  const isAdmin = ['debbie', 'chance'].includes(user.username);
  const isJose = user.username === 'jose';
  const isGreg = user.username === 'greg';
  const isTristen = user.username === 'tristen';
  const isLine = user.username.startsWith('line');
  const canManageParts = ['tammy', 'chance', 'debbie', 'jose', 'greg', 'tristen'].includes(user.username);
  const canSeeSchedule = !isLine;

  const panelContent: Record<Exclude<PanelKey, null>, { title: string; text: string }> = {
    requests: { title: 'Live Material Requests', text: 'Open the live request workflow to send, accept, track, deliver, or confirm material requests.' },
    parts: { title: 'Model & Parts Setup', text: 'Open model parts, part numbers, quantities, and storage locations.' },
    schedule: { title: 'Production Schedule', text: 'View the current production plan and, where permitted, update production priorities and status.' },
    inventory: { title: 'Inventory & Material Readiness', text: 'Use the parts setup and live request data to review material locations, shortages, and readiness.' },
    performance: { title: 'Performance', text: 'Review delivery activity and request timing from the live request workflow. More shift metrics can be added next.' },
    alerts: { title: 'Needs Attention', text: 'Use urgent live requests and material readiness information to identify items that need action.' },
    workflow: { title: 'Workflow Control', text: 'Open the live request board, production schedule, or model setup to control the active workflow.' },
    audit: { title: 'Activity & Change History', text: 'Review operational changes through request status history and schedule updates. A dedicated audit log is the next step.' },
    lines: { title: 'Assembly Lines 1–4', text: 'Open the live request control board to see activity and material needs across all four assembly lines.' },
    handoff: { title: 'Shift Handoff', text: 'Review open requests, incomplete deliveries, and production schedule items before the next shift.' },
  };

  return (
    <main className="shell">
      <section className="dashboardHeader">
        <div><p className="eyebrow">LineFlow AI Dashboard</p><h1 className="dashboardTitle">Welcome, {user.name}</h1><p className="dashboardRole">{user.role}</p></div>
        <button className="secondaryButton" onClick={signOut}>Sign Out</button>
      </section>

      <div id="requests"><MaterialRequestFlow user={user} /></div>
      {canManageParts && <div id="parts"><ModelPartsSetup user={user} /></div>}

      {isTammy && <>
        <section className="sectionBlock"><p className="eyebrow">Remote Operations Leadership</p><h2>Houston Operations Overview</h2><p className="dashboardRole">Every feature card below opens a live tool or operational detail view.</p></section>
        <section className="dashboardGrid">
          <ClickCard label="Production Schedule" value="View & Modify" text="Control priorities, targets, status, comments, holds, and production-plan changes." panel="schedule" onOpen={openPanel} />
          <ClickCard label="Assembly Lines" value="Lines 1–4" text="Monitor requests, urgent needs, delays, and completed deliveries." panel="lines" onOpen={openPanel} />
          <ClickCard label="Material Operations" value="Live Flow" text="Monitor Greg, Tristen, boom materials, hoods, and deliveries." panel="requests" onOpen={openPanel} />
          <ClickCard label="Inventory" value="Plant Visibility" text="Review locations, shortages, low stock, damage, and readiness." panel="inventory" onOpen={openPanel} />
          <ClickCard label="Leadership Alerts" value="Needs Attention" text="Surface urgent requests, production risks, and workflow exceptions." panel="alerts" onOpen={openPanel} />
          <ClickCard label="Performance" value="Goals & Reports" text="Review delivery performance, request timing, and trends." panel="performance" onOpen={openPanel} />
          <ClickCard label="Workflow Control" value="Full Access" text="Open routing, request, schedule, and model controls." panel="workflow" onOpen={openPanel} />
          <ClickCard label="Audit History" value="Who Changed What" text="Review operational changes and status history." panel="audit" onOpen={openPanel} />
        </section>
      </>}

      {isAdmin && <section className="dashboardGrid">
        <ClickCard label="Production Plan" value="View & Update" text="Start, continue, complete, hold, and material readiness." panel="schedule" onOpen={openPanel} />
        <ClickCard label="Live Requests" value="All 4 Lines" text="Monitor open, urgent, active, and delivered requests." panel="requests" onOpen={openPanel} />
        <ClickCard label="Inventory" value="Live Status" text="Review locations, shortages, overages, and low-stock risk." panel="inventory" onOpen={openPanel} />
        <ClickCard label="Operations" value="Full Control" text="Open workflow controls, parts, schedule, and request activity." panel="workflow" onOpen={openPanel} />
        {user.username === 'chance' && <>
          <ClickCard label="Needs Attention" value="Houston Floor" text="Open urgent requests and operational risks that need supervisor action." panel="alerts" onOpen={openPanel} />
          <ClickCard label="Shift Handoff" value="Open Items" text="Review work that must carry into the next shift." panel="handoff" onOpen={openPanel} />
        </>}
      </section>}

      {isJose && <section className="dashboardGrid">
        <ClickCard label="Boom Line" value="Material Oversight" text="Monitor boom-line readiness, material status, shortages, and open issues." panel="inventory" onOpen={openPanel} />
        <ClickCard label="Production Schedule" value="View & Update" text="Update boom-line schedule, completion targets, status, and comments." panel="schedule" onOpen={openPanel} />
        <ClickCard label="Inventory" value="Boom Material Status" text="Review boom parts, quantities, staging locations, and material risk." panel="parts" onOpen={openPanel} />
        <ClickCard label="Delivery Support" value="Greg Workflow" text="Open boom requests and delivery activity supporting the boom line." panel="requests" onOpen={openPanel} />
      </section>}

      {isGreg && <section className="dashboardGrid">
        <ClickCard label="Assigned Workflow" value="Boom Materials" text="Open the Combi Lift delivery queue and boom requests." panel="requests" onOpen={openPanel} />
        <ClickCard label="Daily Plan" value="View Boom Plan" text="See start, continue, complete, hold, and waiting-on-material items." panel="schedule" onOpen={openPanel} />
        <ClickCard label="Inventory" value="Boom Locations" text="Open boom parts, quantities, staging locations, and shortages." panel="parts" onOpen={openPanel} />
        <ClickCard label="Performance" value="End-of-Shift" text="Review deliveries, response time, and completed work." panel="performance" onOpen={openPanel} />
      </section>}

      {isTristen && <section className="dashboardGrid">
        <ClickCard label="Assigned Workflow" value="Hood Materials" text="Open the forklift delivery queue and hood requests." panel="requests" onOpen={openPanel} />
        <ClickCard label="Hood Storage" value="32 Rows" text="Open hood material setup and row/location details." panel="parts" onOpen={openPanel} />
        <ClickCard label="Inventory" value="Hood Availability" text="Review quantities, row locations, and material readiness." panel="inventory" onOpen={openPanel} />
        <ClickCard label="Performance" value="End-of-Shift" text="Review deliveries, response time, trips, and completed work." panel="performance" onOpen={openPanel} />
      </section>}

      {isLine && <section className="dashboardGrid">
        <ClickCard label="Material Request" value="Live Ordering" text="Open the request form and send a model or individual-part request." panel="requests" onOpen={openPanel} />
        <ClickCard label="Active Requests" value="Track Status" text="Track Requested → Accepted → Picked Up → In Transit → Delivered → Confirmed." panel="requests" onOpen={openPanel} />
        <ClickCard label="Priority" value="Normal / Urgent" text="Open your requests and see urgent status and progress." panel="requests" onOpen={openPanel} />
        <ClickCard label="Recent Deliveries" value="Delivery History" text="Open your request history and confirm received deliveries." panel="requests" onOpen={openPanel} />
      </section>}

      {activePanel && <section id="dashboard-tool-panel" className="sectionBlock dashboardToolPanel">
        <div className="toolPanelHeader">
          <div><p className="eyebrow">Interactive Tool</p><h2>{panelContent[activePanel].title}</h2><p className="dashboardRole">{panelContent[activePanel].text}</p></div>
          <button className="secondaryButton" type="button" onClick={() => setActivePanel(null)}>Close</button>
        </div>

        {activePanel === 'schedule' && canSeeSchedule && <ProductionSchedule />}
        {activePanel === 'schedule' && isLine && <p className="requestMessage">Production schedule editing is not available from a line-user account.</p>}

        {activePanel !== 'schedule' && <div className="toolActions">
          <button className="primaryButton" type="button" onClick={() => jumpTo('requests')}>Open Live Requests</button>
          {canManageParts && <button className="secondaryButton" type="button" onClick={() => jumpTo('parts')}>Open Model & Parts</button>}
          {canSeeSchedule && <button className="secondaryButton" type="button" onClick={() => openPanel('schedule')}>Open Production Schedule</button>}
        </div>}
      </section>}

      <section className="sectionBlock"><p className="eyebrow">Demo Status</p><h2>Interactive dashboard navigation is active.</h2><p className="dashboardRole">Feature cards now behave like controls instead of static information. Each user is routed to the tools appropriate for their role.</p></section>
    </main>
  );
}

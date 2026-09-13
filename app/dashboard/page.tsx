'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MaterialRequestFlow from '../../components/MaterialRequestFlow';
import ModelPartsSetup from '../../components/ModelPartsSetup';
import ProductionSchedule from '../../components/ProductionSchedule';

type UserGroup = 'line' | 'handler' | 'supervisor' | 'specialist';
type DemoUser = { name: string; role: string; username: string; group?: UserGroup };
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

function inferGroup(user: DemoUser): UserGroup {
  if (user.group) return user.group;
  if (user.username.startsWith('line')) return 'line';
  if (['greg', 'tristen'].includes(user.username)) return 'handler';
  if (user.username === 'jose') return 'specialist';
  return 'supervisor';
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<DemoUser | null>(null);
  const [activePanel, setActivePanel] = useState<PanelKey>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lineflowUser');
    if (!saved) {
      router.replace('/login');
      return;
    }

    try {
      setUser(JSON.parse(saved));
    } catch {
      localStorage.removeItem('lineflowUser');
      router.replace('/login');
    }
  }, [router]);

  function signOut() {
    localStorage.removeItem('lineflowUser');
    router.push('/login');
  }

  function switchRole() {
    localStorage.removeItem('lineflowUser');
    router.push('/login');
  }

  function openPanel(panel: Exclude<PanelKey, null>) {
    setActivePanel(panel);
    window.setTimeout(() => {
      document.getElementById('dashboard-tool-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  function jumpTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (!user) return <main className="shell"><p>Loading LineFlow AI...</p></main>;

  const group = inferGroup(user);
  const isLine = group === 'line';
  const isHandler = group === 'handler';
  const isSupervisor = group === 'supervisor';
  const isSpecialist = group === 'specialist';
  const isGreg = user.username === 'greg';
  const isTristen = user.username === 'tristen';
  const isTammy = user.username === 'tammy';
  const isChance = user.username === 'chance';

  const canViewRequests = true;
  const canUpdateDelivery = isHandler;
  const canConfirmDelivery = isLine;
  const canViewParts = !isLine;
  const canEditParts = isSupervisor || isSpecialist;
  const canViewSchedule = !isLine;
  const canEditSchedule = isSupervisor || isSpecialist;
  const canViewAllLines = isSupervisor || isSpecialist;

  const accessTitle = isLine
    ? 'Line User View'
    : isHandler
      ? 'Material Handler View'
      : isSpecialist
        ? 'Boom Line Material Specialist View'
        : 'Supervisor / Planner View';

  const accessText = isLine
    ? 'Create material requests, track status, and confirm delivery. Supervisor and inventory controls are hidden.'
    : isHandler
      ? 'Receive assigned requests, check off parts, update delivery status, and review the material information needed for your route.'
      : isSpecialist
        ? 'Monitor boom-line material readiness, parts, schedule status, shortages, and production support.'
        : 'Monitor all lines, production priorities, material flow, inventory, handlers, alerts, and operational controls.';

  const panelContent: Record<Exclude<PanelKey, null>, { title: string; text: string }> = {
    requests: { title: 'Live Material Requests', text: 'Open the live request workflow to send, accept, track, deliver, or confirm material requests.' },
    parts: { title: 'Model & Parts Setup', text: canEditParts ? 'Review and manage model parts, part numbers, quantities, and storage locations.' : 'Review model parts, part numbers, quantities, and storage locations.' },
    schedule: { title: 'Production Schedule', text: canEditSchedule ? 'Review production status, priorities, targets, and schedule changes.' : 'Review the current production plan and upcoming work.' },
    inventory: { title: 'Inventory & Material Readiness', text: 'Review material locations, shortages, readiness, and items that could affect production.' },
    performance: { title: 'Performance', text: 'Review delivery activity, completed work, and request timing.' },
    alerts: { title: 'Needs Attention', text: 'Review urgent requests, production risks, shortages, and workflow exceptions.' },
    workflow: { title: 'Workflow Control', text: 'Open the request board, production schedule, or parts information available to this account.' },
    audit: { title: 'Activity & Change History', text: 'Review operational status changes and workflow activity.' },
    lines: { title: 'Assembly Lines 1–4', text: 'Monitor material activity and needs across all four assembly lines.' },
    handoff: { title: 'Shift Handoff', text: 'Review open requests, incomplete deliveries, and production items that carry into the next shift.' },
  };

  return (
    <main className="shell">
      <section className="dashboardHeader">
        <div>
          <p className="eyebrow">LineFlow AI Dashboard</p>
          <h1 className="dashboardTitle">Welcome, {user.name}</h1>
          <p className="dashboardRole">{user.role}</p>
        </div>
        <div className="actions" style={{ marginTop: 0 }}>
          <button className="secondaryButton" type="button" onClick={switchRole}>Switch Demo Role</button>
          <button className="secondaryButton" type="button" onClick={signOut}>Sign Out</button>
        </div>
      </section>

      <section className="sectionBlock dashboardToolPanel">
        <p className="eyebrow">Your Access</p>
        <h2>{accessTitle}</h2>
        <p className="dashboardRole">{accessText}</p>
        <div className="toolActions">
          <span className="statusStrip">✓ Live requests</span>
          {canUpdateDelivery && <span className="statusStrip">✓ Update delivery</span>}
          {canConfirmDelivery && <span className="statusStrip">✓ Confirm received</span>}
          {canViewParts && <span className="statusStrip">✓ Parts & locations</span>}
          {canViewSchedule && <span className="statusStrip">✓ Production schedule</span>}
          {canViewAllLines && <span className="statusStrip">✓ All-line visibility</span>}
        </div>
      </section>

      {isLine && (
        <section className="dashboardGrid">
          <ClickCard label="Request Material" value="Create Request" text="Choose Boom or Hood, select a model or individual part, set priority, and send it." panel="requests" onOpen={openPanel} />
          <ClickCard label="Track Requests" value="Live Status" text="Follow Requested → Accepted → Picked Up → In Transit → Delivered → Confirmed." panel="requests" onOpen={openPanel} />
          <ClickCard label="Urgent Need" value="Set Priority" text="Mark a request urgent when production is at risk or material is needed immediately." panel="requests" onOpen={openPanel} />
          <ClickCard label="Confirm Delivery" value="Received" text="Confirm delivered material so the request can be closed." panel="requests" onOpen={openPanel} />
        </section>
      )}

      {isHandler && (
        <section className="dashboardGrid">
          <ClickCard label="Assigned Requests" value={isGreg ? 'Boom Queue' : isTristen ? 'Hood Queue' : 'My Queue'} text="Accept requests assigned to your material route and work them in priority order." panel="requests" onOpen={openPanel} />
          <ClickCard label="Part Checklist" value="Pick & Deliver" text="See required parts, part numbers, quantities, and locations; check each item as delivered." panel="requests" onOpen={openPanel} />
          <ClickCard label="Parts & Locations" value="Reference" text="Review model material information before picking and staging material." panel="parts" onOpen={openPanel} />
          <ClickCard label="Production Plan" value="Read Only" text="Review the production schedule so material can be staged ahead of demand." panel="schedule" onOpen={openPanel} />
        </section>
      )}

      {isSpecialist && (
        <section className="dashboardGrid">
          <ClickCard label="Boom Line" value="Material Readiness" text="Monitor boom material availability, shortages, staging, and production support." panel="inventory" onOpen={openPanel} />
          <ClickCard label="Live Requests" value="Boom Support" text="Monitor boom delivery activity and requests supporting production." panel="requests" onOpen={openPanel} />
          <ClickCard label="Model & Parts" value="Manage" text="Maintain boom part numbers, quantities, and storage or staging locations." panel="parts" onOpen={openPanel} />
          <ClickCard label="Production Schedule" value="View & Update" text="Track schedule status, completion targets, holds, and material readiness." panel="schedule" onOpen={openPanel} />
        </section>
      )}

      {isSupervisor && (
        <>
          {isTammy && <section className="sectionBlock"><p className="eyebrow">Remote Operations Leadership</p><h2>Houston Operations Overview</h2><p className="dashboardRole">Use this view for plant-wide visibility without needing to be on the production floor.</p></section>}
          <section className="dashboardGrid">
            <ClickCard label="All Material Requests" value="Lines 1–4" text="Monitor open, urgent, active, delivered, and confirmed requests across production." panel="requests" onOpen={openPanel} />
            <ClickCard label="Production Plan" value="View & Update" text="Review priorities, targets, status, holds, comments, and schedule changes." panel="schedule" onOpen={openPanel} />
            <ClickCard label="Inventory" value="Plant Visibility" text="Review material locations, shortages, readiness, and low-stock risk." panel="inventory" onOpen={openPanel} />
            <ClickCard label="Workflow Control" value="Full Operations" text="Open requests, parts, schedule, and current workflow information." panel="workflow" onOpen={openPanel} />
            <ClickCard label="Needs Attention" value={isChance ? 'Houston Floor' : 'Alerts'} text="Review urgent requests, production risks, and workflow exceptions." panel="alerts" onOpen={openPanel} />
            <ClickCard label="Assembly Lines" value="1–4" text="Monitor material needs and delivery activity across every line." panel="lines" onOpen={openPanel} />
            <ClickCard label="Performance" value="Goals & Reports" text="Review delivery activity, request timing, and completed work." panel="performance" onOpen={openPanel} />
            <ClickCard label="Shift Handoff" value="Open Items" text="Review incomplete requests and work that must carry into the next shift." panel="handoff" onOpen={openPanel} />
          </section>
        </>
      )}

      {canViewRequests && <div id="requests"><MaterialRequestFlow user={user} /></div>}
      {canViewParts && <div id="parts"><ModelPartsSetup user={user} /></div>}

      {activePanel && (
        <section id="dashboard-tool-panel" className="sectionBlock dashboardToolPanel">
          <div className="toolPanelHeader">
            <div>
              <p className="eyebrow">Interactive Tool</p>
              <h2>{panelContent[activePanel].title}</h2>
              <p className="dashboardRole">{panelContent[activePanel].text}</p>
            </div>
            <button className="secondaryButton" type="button" onClick={() => setActivePanel(null)}>Close</button>
          </div>

          {activePanel === 'schedule' && canViewSchedule && <ProductionSchedule />}
          {activePanel === 'schedule' && !canViewSchedule && <p className="requestMessage">The production schedule is not available from a line-user account.</p>}

          {activePanel !== 'schedule' && (
            <div className="toolActions">
              <button className="primaryButton" type="button" onClick={() => jumpTo('requests')}>Open Live Requests</button>
              {canViewParts && <button className="secondaryButton" type="button" onClick={() => jumpTo('parts')}>Open Model & Parts</button>}
              {canViewSchedule && <button className="secondaryButton" type="button" onClick={() => openPanel('schedule')}>Open Production Schedule</button>}
            </div>
          )}
        </section>
      )}

      <section className="sectionBlock">
        <p className="eyebrow">Role-Based Access</p>
        <h2>Each login now gets its own operational view.</h2>
        <p className="dashboardRole">Line users focus on requesting and confirming material. Material handlers focus on picking and delivery. Specialists focus on readiness. Supervisors and planners get plant-wide visibility and controls.</p>
      </section>
    </main>
  );
}

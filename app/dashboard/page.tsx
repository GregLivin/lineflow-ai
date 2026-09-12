'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type DemoUser = { name: string; role: string; username: string };

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<DemoUser | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lineflowUser');
    if (!saved) {
      router.replace('/login');
      return;
    }
    setUser(JSON.parse(saved));
  }, [router]);

  function signOut() {
    localStorage.removeItem('lineflowUser');
    router.push('/login');
  }

  if (!user) {
    return <main className="shell"><p>Loading LineFlow AI...</p></main>;
  }

  const isAdmin = ['debbie', 'tammy', 'chance'].includes(user.username);
  const isJose = user.username === 'jose';
  const isGreg = user.username === 'greg';
  const isTristen = user.username === 'tristen';
  const isLine = user.username.startsWith('line');

  return (
    <main className="shell">
      <section className="dashboardHeader">
        <div>
          <p className="eyebrow">LineFlow AI Dashboard</p>
          <h1 className="dashboardTitle">Welcome, {user.name}</h1>
          <p className="dashboardRole">{user.role}</p>
        </div>
        <button className="secondaryButton" onClick={signOut}>Sign Out</button>
      </section>

      {isAdmin && (
        <section className="dashboardGrid">
          <article className="metricCard"><span>Production Plan</span><strong>View & Update</strong><p>Start, continue, complete, hold, and material readiness.</p></article>
          <article className="metricCard"><span>Live Requests</span><strong>All 4 Lines</strong><p>Monitor open, urgent, and delivered requests.</p></article>
          <article className="metricCard"><span>Inventory</span><strong>Live Status</strong><p>Review locations, shortages, overages, and low-stock alerts.</p></article>
          <article className="metricCard"><span>Operations</span><strong>Full Control</strong><p>Manage routing, priorities, goals, reports, and workflow changes.</p></article>
        </section>
      )}

      {isJose && (
        <section className="dashboardGrid">
          <article className="metricCard"><span>Boom Line</span><strong>Material Oversight</strong><p>Monitor boom-line readiness, material status, shortages, and open issues.</p></article>
          <article className="metricCard"><span>Production Schedule</span><strong>View & Update</strong><p>Jose can update the boom-line schedule, completion targets, status, and comments.</p></article>
          <article className="metricCard"><span>Inventory</span><strong>Boom Material Status</strong><p>Review boom parts, quantities, staging locations, and material risk.</p></article>
          <article className="metricCard"><span>Delivery Support</span><strong>Greg Workflow</strong><p>See boom requests and delivery activity supporting the boom line.</p></article>
        </section>
      )}

      {isGreg && (
        <section className="dashboardGrid">
          <article className="metricCard"><span>Assigned Workflow</span><strong>Boom Materials</strong><p>Combi Lift delivery queue and boom requests.</p></article>
          <article className="metricCard"><span>Daily Plan</span><strong>View Boom Plan</strong><p>See start, continue, complete, hold, and waiting-on-material items.</p></article>
          <article className="metricCard"><span>Inventory</span><strong>Boom Locations</strong><p>Check parts, quantities, staging locations, and shortages.</p></article>
          <article className="metricCard"><span>Performance</span><strong>End-of-Shift</strong><p>Deliveries, on-time rate, response time, and issues.</p></article>
        </section>
      )}

      {isTristen && (
        <section className="dashboardGrid">
          <article className="metricCard"><span>Assigned Workflow</span><strong>Hood Materials</strong><p>Forklift delivery queue and hood requests.</p></article>
          <article className="metricCard"><span>Hood Storage</span><strong>32 Rows</strong><p>31 hood rows plus 1 miscellaneous row.</p></article>
          <article className="metricCard"><span>Inventory</span><strong>Hood Availability</strong><p>Check quantities, row locations, and low-stock alerts.</p></article>
          <article className="metricCard"><span>Performance</span><strong>End-of-Shift</strong><p>Deliveries, on-time rate, trips, and issues.</p></article>
        </section>
      )}

      {isLine && (
        <section className="dashboardGrid">
          <article className="metricCard"><span>Material Request</span><strong>Place New Order</strong><p>Request material for {user.name}.</p></article>
          <article className="metricCard"><span>Active Requests</span><strong>Track Status</strong><p>Requested → Accepted → Picked Up → In Transit → Delivered.</p></article>
          <article className="metricCard"><span>Priority</span><strong>Normal / Urgent</strong><p>Priority options will follow the approved production workflow.</p></article>
          <article className="metricCard"><span>Recent Deliveries</span><strong>Delivery History</strong><p>Review what was delivered and when.</p></article>
        </section>
      )}

      <section className="sectionBlock">
        <p className="eyebrow">Demo Status</p>
        <h2>Role login is active.</h2>
        <p className="dashboardRole">Next we will connect these dashboard actions to the shared LineFlow database and live request workflow.</p>
      </section>
    </main>
  );
}

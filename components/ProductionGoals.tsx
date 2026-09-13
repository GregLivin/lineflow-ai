'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type User = { name: string; username: string; role: string };
type Unit = { status: string; completed_at: string | null };
type Goal = { goal_date: string; green_tag_target: number; updated_by: string | null };

const supervisors = ['tammy','chance','debbie','jose'];

export default function ProductionGoals({ user }: { user: User }) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [target, setTarget] = useState(3);
  const [editingTarget, setEditingTarget] = useState(3);
  const [status, setStatus] = useState('');
  const canEdit = supervisors.includes(user.username);
  const today = useMemo(() => new Date().toLocaleDateString('en-CA'), []);

  async function load() {
    const [{ data: yardData }, { data: goalData }] = await Promise.all([
      supabase.from('yard_reconditioning_units').select('status, completed_at'),
      supabase.from('daily_production_goals').select('goal_date, green_tag_target, updated_by').eq('goal_date', today).maybeSingle(),
    ]);
    setUnits((yardData ?? []) as Unit[]);
    const goal = goalData as Goal | null;
    const nextTarget = goal?.green_tag_target ?? 3;
    setTarget(nextTarget);
    setEditingTarget(nextTarget);
  }

  useEffect(() => {
    load();
    const yardChannel = supabase.channel('production-goals-yard').on('postgres_changes', { event: '*', schema: 'public', table: 'yard_reconditioning_units' }, load).subscribe();
    const goalChannel = supabase.channel('production-goals-daily').on('postgres_changes', { event: '*', schema: 'public', table: 'daily_production_goals' }, load).subscribe();
    return () => { supabase.removeChannel(yardChannel); supabase.removeChannel(goalChannel); };
  }, [today]);

  const completedToday = units.filter(unit => unit.completed_at && unit.completed_at.slice(0, 10) === today).length;
  const waitingOnMaterial = units.filter(unit => unit.status === 'Waiting on Material').length;
  const remainingToday = Math.max(target - completedToday, 0);
  const percent = Math.min(100, Math.round((completedToday / Math.max(target, 1)) * 100));
  const goalMet = completedToday >= target;

  async function saveTarget() {
    if (!canEdit) return;
    const clean = Math.max(1, Number(editingTarget) || 1);
    setStatus('Saving...');
    const { error } = await supabase.from('daily_production_goals').upsert({ goal_date: today, green_tag_target: clean, updated_by: user.name, updated_at: new Date().toISOString() });
    setStatus(error ? 'Goal could not be saved.' : 'Daily goal updated.');
    if (!error) await load();
  }

  return (
    <section className="sectionBlock" id="production-goals">
      <div className="sectionHeading">
        <div>
          <p className="eyebrow">Production Goals</p>
          <h2>Today&apos;s Green Tag Goal</h2>
          <p className="dashboardRole">Live progress based on boom lifts marked Completed / Green Tag today.</p>
        </div>
      </div>

      <div className="dashboardGrid">
        <div className="metricCard"><span>Daily Target</span><strong>{target}</strong><p>Green tags planned for today.</p></div>
        <div className="metricCard"><span>Completed Today</span><strong>{completedToday}</strong><p>Units completed and green tagged today.</p></div>
        <div className="metricCard"><span>Remaining Today</span><strong>{remainingToday}</strong><p>{goalMet ? 'Daily goal reached.' : 'Green tags still needed to hit today’s target.'}</p></div>
        <div className="metricCard"><span>Waiting on Material</span><strong>{waitingOnMaterial}</strong><p>Units currently blocked by material shortages.</p></div>
      </div>

      <div className="sectionBlock" style={{ marginTop: 18 }}>
        <div className="toolPanelHeader">
          <div><p className="eyebrow">Goal Progress</p><h3>{percent}% complete</h3><p className="dashboardRole">{completedToday} of {target} green tags completed today.</p></div>
          <strong style={{ fontSize: '1.7rem' }}>{goalMet ? 'Goal Met' : `${remainingToday} Remaining`}</strong>
        </div>
        <div style={{ height: 14, borderRadius: 999, background: '#071321', overflow: 'hidden', marginTop: 16 }}>
          <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #22c55e)', transition: 'width 220ms ease' }} />
        </div>
      </div>

      {canEdit && <div className="sectionBlock" style={{ marginTop: 18 }}>
        <p className="eyebrow">Supervisor Control</p><h3>Set today&apos;s green tag target</h3>
        <div className="toolActions">
          <input type="number" min="1" value={editingTarget} onChange={e => setEditingTarget(Math.max(1, Number(e.target.value) || 1))} style={{ width: 120, borderRadius: 12, border: '1px solid rgba(148,163,184,.18)', background: '#071321', color: '#f8fafc', padding: '12px 13px' }} />
          <button className="primaryButton" type="button" onClick={saveTarget}>Save Daily Goal</button>
          {status && <span className="dashboardRole">{status}</span>}
        </div>
      </div>}
    </section>
  );
}

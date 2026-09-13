'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type User = { name: string; username: string; role: string };
type Status = 'Needs Reconditioning' | 'In Progress' | 'Waiting on Material' | 'Completed / Green Tag' | 'Ready to Ship';
type Unit = { id: string; unit_number: string; model: string; yard_location: string | null; status: Status; notes: string | null; updated_by: string | null; updated_at: string; completed_at: string | null };

const statuses: Status[] = ['Needs Reconditioning','In Progress','Waiting on Material','Completed / Green Tag','Ready to Ship'];
const models = ['600S','800S','1200SJP','1500SJ'];
const supervisors = ['tammy','chance','debbie','jose'];

export default function YardReconditioning({ user }: { user: User }) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitNumber, setUnitNumber] = useState('');
  const [model, setModel] = useState('1200SJP');
  const [location, setLocation] = useState('Yard');
  const [status, setStatus] = useState<Status>('Needs Reconditioning');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const canManage = supervisors.includes(user.username);

  async function load() {
    const { data } = await supabase.from('yard_reconditioning_units').select('*').order('updated_at', { ascending: false });
    setUnits((data ?? []) as Unit[]);
  }

  useEffect(() => {
    load();
    const channel = supabase.channel('yard-reconditioning-live').on('postgres_changes', { event: '*', schema: 'public', table: 'yard_reconditioning_units' }, load).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const counts = useMemo(() => ({
    total: units.length,
    needs: units.filter(u => u.status === 'Needs Reconditioning').length,
    progress: units.filter(u => u.status === 'In Progress').length,
    waiting: units.filter(u => u.status === 'Waiting on Material').length,
    completed: units.filter(u => u.status === 'Completed / Green Tag').length,
    ready: units.filter(u => u.status === 'Ready to Ship').length,
  }), [units]);

  const remaining = counts.needs + counts.progress + counts.waiting;
  const daysAtGoal = Math.ceil(remaining / 3);

  async function addUnit(e: FormEvent) {
    e.preventDefault();
    if (!canManage || !unitNumber.trim()) return;
    const completedAt = status === 'Completed / Green Tag' || status === 'Ready to Ship' ? new Date().toISOString() : null;
    const { error } = await supabase.from('yard_reconditioning_units').insert({ unit_number: unitNumber.trim(), model, yard_location: location.trim() || null, status, notes: notes.trim() || null, updated_by: user.name, completed_at: completedAt });
    if (error) { setMessage('Unit could not be added. Check that the unit number is unique.'); return; }
    setUnitNumber(''); setNotes(''); setMessage('Boom lift added to yard inventory.'); await load();
  }

  async function changeStatus(unit: Unit, next: Status) {
    if (!canManage) return;
    const now = new Date().toISOString();
    const completedAt = next === 'Completed / Green Tag'
      ? (unit.completed_at || now)
      : next === 'Ready to Ship'
        ? (unit.completed_at || now)
        : null;
    await supabase.from('yard_reconditioning_units').update({ status: next, completed_at: completedAt, updated_by: user.name, updated_at: now }).eq('id', unit.id);
    await load();
  }

  return (
    <section className="sectionBlock" id="yard-reconditioning">
      <div className="sectionHeading"><div><p className="eyebrow">Yard & Reconditioning Inventory</p><h2>Boom Lift Reconditioning Status</h2><p className="dashboardRole">Exact live counts of boom lifts in the yard, work remaining, completed green tags, and units ready to ship.</p></div></div>
      <div className="dashboardGrid">
        <div className="metricCard"><span>Total Units in Yard</span><strong>{counts.total}</strong><p>All tracked boom lifts currently in the yard system.</p></div>
        <div className="metricCard"><span>Needs Reconditioning</span><strong>{counts.needs}</strong><p>Units waiting for reconditioning to begin.</p></div>
        <div className="metricCard"><span>In Progress</span><strong>{counts.progress}</strong><p>Units actively being reconditioned.</p></div>
        <div className="metricCard"><span>Waiting on Material</span><strong>{counts.waiting}</strong><p>Units currently blocked by material.</p></div>
        <div className="metricCard"><span>Completed / Green Tag</span><strong>{counts.completed}</strong><p>Reconditioning completed.</p></div>
        <div className="metricCard"><span>Ready to Ship</span><strong>{counts.ready}</strong><p>Completed units cleared for shipment.</p></div>
      </div>
      <div className="sectionBlock" style={{ marginTop: 18 }}><p className="eyebrow">Backlog vs Goal</p><h3>{remaining} units remaining · {daysAtGoal} production days at 3 green tags/day</h3><p className="dashboardRole">This estimate updates automatically as unit statuses change.</p></div>
      {canManage && <form className="addModelPartForm" onSubmit={addUnit}>
        <div><p className="eyebrow">Add Yard Unit</p><h3>Register a boom lift</h3></div>
        <div className="requestFormGrid">
          <label>Unit / Serial Number<input required value={unitNumber} onChange={e => setUnitNumber(e.target.value)} placeholder="Enter unique unit number" /></label>
          <label>Model<select value={model} onChange={e => setModel(e.target.value)}>{models.map(m => <option key={m}>{m}</option>)}</select></label>
          <label>Yard Location<input value={location} onChange={e => setLocation(e.target.value)} placeholder="Yard location" /></label>
          <label>Status<select value={status} onChange={e => setStatus(e.target.value as Status)}>{statuses.map(s => <option key={s}>{s}</option>)}</select></label>
        </div>
        <label className="notesLabel">Notes<textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Material needs, condition, hold reason, or other notes" /></label>
        <button className="primaryButton" type="submit">Add Boom Lift</button>{message && <p className="requestMessage">{message}</p>}
      </form>}
      <div className="modelPartsTableWrap" style={{ marginTop: 20 }}><table className="modelPartsTable"><thead><tr><th>Unit</th><th>Model</th><th>Location</th><th>Status</th><th>Notes</th><th>Updated By</th></tr></thead><tbody>
        {units.length === 0 ? <tr><td colSpan={6}>No boom lifts entered yet. Add the yard units to begin tracking exact counts.</td></tr> : units.map(unit => <tr key={unit.id}>
          <td><strong>{unit.unit_number}</strong></td><td>{unit.model}</td><td>{unit.yard_location || '—'}</td>
          <td>{canManage ? <select value={unit.status} onChange={e => changeStatus(unit, e.target.value as Status)}>{statuses.map(s => <option key={s}>{s}</option>)}</select> : unit.status}</td>
          <td>{unit.notes || '—'}</td><td>{unit.updated_by || '—'}</td>
        </tr>)}
      </tbody></table></div>
    </section>
  );
}

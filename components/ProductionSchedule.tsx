'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type ScheduleRow = {
  id: string;
  priority: string;
  job: string;
  model: string;
  serial: string;
  status: string;
  boom: string;
  completion: string;
  comments: string;
};

type SavedUser = { username?: string; name?: string };

type DbScheduleRow = {
  id: string;
  priority: number | null;
  job: string | null;
  model: string | null;
  serial: string | null;
  status: string | null;
  boom: string | null;
  complete_by: string | null;
  comments: string | null;
  updated_by: string | null;
};

const editors = ['debbie', 'tammy', 'chance', 'jose'];

function mapDbRow(row: DbScheduleRow): ScheduleRow {
  return {
    id: row.id,
    priority: row.priority?.toString() ?? '',
    job: row.job ?? '',
    model: row.model ?? '',
    serial: row.serial ?? '',
    status: row.status ?? 'Planned',
    boom: row.boom ?? '',
    completion: row.complete_by ? row.complete_by.slice(0, 16) : '',
    comments: row.comments ?? '',
  };
}

export default function ProductionSchedule() {
  const [rows, setRows] = useState<ScheduleRow[]>([]);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState<SavedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loadedIds, setLoadedIds] = useState<string[]>([]);

  async function loadSchedule(showLoading = false) {
    if (showLoading) setLoading(true);

    const { data, error } = await supabase
      .from('production_schedule')
      .select('id, priority, job, model, serial, status, boom, complete_by, comments, updated_by')
      .order('priority', { ascending: true });

    if (error) {
      setMessage('Unable to load the shared schedule.');
      setLoading(false);
      return;
    }

    const mapped = (data as DbScheduleRow[]).map(mapDbRow);
    setRows(mapped);
    setLoadedIds(mapped.map(row => row.id));
    setLoading(false);
  }

  useEffect(() => {
    const savedUser = localStorage.getItem('lineflowUser');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch { /* signed out */ }
    }

    loadSchedule(true);

    const channel = supabase
      .channel('lineflow-production-schedule')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'production_schedule' },
        () => {
          if (!editing) loadSchedule();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [editing]);

  const canEdit = useMemo(
    () => !!user?.username && editors.includes(user.username.toLowerCase()),
    [user]
  );

  function updateRow(id: string, field: keyof ScheduleRow, value: string) {
    setRows(current => current.map(row => row.id === id ? { ...row, [field]: value } : row));
  }

  function addRow() {
    setRows(current => [...current, {
      id: crypto.randomUUID(),
      priority: String(current.length + 1),
      job: '',
      model: '',
      serial: '',
      status: 'Planned',
      boom: '',
      completion: '',
      comments: '',
    }]);
  }

  function removeRow(id: string) {
    setRows(current => current.filter(row => row.id !== id));
  }

  async function saveSchedule() {
    if (!canEdit || !user?.username) return;

    setSaving(true);
    setMessage('');

    const currentIds = rows.map(row => row.id);
    const removedIds = loadedIds.filter(id => !currentIds.includes(id));

    if (removedIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('production_schedule')
        .delete()
        .in('id', removedIds);

      if (deleteError) {
        setMessage('Could not remove one or more schedule rows.');
        setSaving(false);
        return;
      }
    }

    const payload = rows.map((row, index) => ({
      id: row.id,
      priority: Number.parseInt(row.priority, 10) || index + 1,
      job: row.job || null,
      model: row.model || null,
      serial: row.serial || null,
      status: row.status || 'Planned',
      boom: row.boom || null,
      complete_by: row.completion ? new Date(row.completion).toISOString() : null,
      comments: row.comments || null,
      updated_by: user.username,
    }));

    const { error } = await supabase
      .from('production_schedule')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      setMessage('Schedule changes could not be saved.');
      setSaving(false);
      return;
    }

    setEditing(false);
    setSaving(false);
    setMessage('Schedule saved. Everyone will see the update live.');
    await loadSchedule();
  }

  return (
    <section className="sectionBlock scheduleSection">
      <div className="scheduleHeader">
        <div>
          <p className="eyebrow">Live Production Schedule</p>
          <h2>Today&apos;s Boom / Production Plan</h2>
          <p className="dashboardRole">Shared live schedule for Houston operations and remote leadership.</p>
        </div>
        <div className="scheduleActions">
          {canEdit && !editing && <button className="secondaryButton" onClick={() => { setEditing(true); setMessage(''); }}>Edit Schedule</button>}
          {canEdit && editing && <>
            <button className="secondaryButton" onClick={addRow}>Add Row</button>
            <button className="primaryButton" disabled={saving} onClick={saveSchedule}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </>}
        </div>
      </div>

      {message && <p className="scheduleFootnote">{message}</p>}

      <div className="scheduleTableWrap">
        <table className="scheduleTable">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Job</th>
              <th>Model</th>
              <th>Serial</th>
              <th>Status</th>
              <th>Boom</th>
              <th>Complete By</th>
              <th>Comments</th>
              {editing && canEdit ? <th /> : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={editing && canEdit ? 9 : 8}>Loading live schedule...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={editing && canEdit ? 9 : 8}>No production schedule rows yet.</td></tr>
            ) : rows.map(row => (
              <tr key={row.id}>
                {(['priority','job','model','serial','status','boom','completion','comments'] as (keyof ScheduleRow)[]).map(field => (
                  <td key={field}>
                    {editing && canEdit ? (
                      <input
                        className="scheduleInput"
                        type={field === 'completion' ? 'datetime-local' : field === 'priority' ? 'number' : 'text'}
                        value={String(row[field])}
                        onChange={e => updateRow(row.id, field, e.target.value)}
                        aria-label={`${field} schedule row`}
                      />
                    ) : (
                      <span className={field === 'status' ? 'scheduleStatus' : ''}>{String(row[field]) || '—'}</span>
                    )}
                  </td>
                ))}
                {editing && canEdit ? (
                  <td><button className="removeRowButton" onClick={() => removeRow(row.id)}>Remove</button></td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="scheduleFootnote">
        Debbie, Tammy, Chance, and Jose can edit. Changes sync across devices in real time.
      </p>
    </section>
  );
}

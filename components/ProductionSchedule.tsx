'use client';

import { useEffect, useMemo, useState } from 'react';

type ScheduleRow = {
  id: number;
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

const defaultRows: ScheduleRow[] = [
  { id: 1, priority: '1', job: '—', model: '1200SJP', serial: '—', status: 'In Progress', boom: '1200', completion: '', comments: '' },
  { id: 2, priority: '2', job: '—', model: '600S', serial: '—', status: 'Planned', boom: '600', completion: '', comments: '' },
  { id: 3, priority: '3', job: '—', model: '800S', serial: '—', status: 'Planned', boom: '800', completion: '', comments: '' },
  { id: 4, priority: '4', job: '—', model: '1500SJ', serial: '—', status: 'Waiting on Material', boom: '1500', completion: '', comments: '' },
];

const editors = ['debbie', 'tammy', 'chance', 'jose'];

export default function ProductionSchedule() {
  const [rows, setRows] = useState<ScheduleRow[]>(defaultRows);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState<SavedUser | null>(null);

  useEffect(() => {
    const savedRows = localStorage.getItem('lineflowProductionSchedule');
    if (savedRows) {
      try { setRows(JSON.parse(savedRows)); } catch { /* keep defaults */ }
    }

    const savedUser = localStorage.getItem('lineflowUser');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch { /* signed out */ }
    }
  }, []);

  const canEdit = useMemo(
    () => !!user?.username && editors.includes(user.username.toLowerCase()),
    [user]
  );

  function updateRow(id: number, field: keyof ScheduleRow, value: string) {
    setRows(current => current.map(row => row.id === id ? { ...row, [field]: value } : row));
  }

  function addRow() {
    const nextId = Math.max(0, ...rows.map(row => row.id)) + 1;
    setRows(current => [...current, {
      id: nextId,
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

  function removeRow(id: number) {
    setRows(current => current.filter(row => row.id !== id));
  }

  function saveSchedule() {
    localStorage.setItem('lineflowProductionSchedule', JSON.stringify(rows));
    setEditing(false);
  }

  return (
    <section className="sectionBlock scheduleSection">
      <div className="scheduleHeader">
        <div>
          <p className="eyebrow">Live Production Schedule</p>
          <h2>Today&apos;s Boom / Production Plan</h2>
          <p className="dashboardRole">Current schedule, completion targets, status, and production notes.</p>
        </div>
        <div className="scheduleActions">
          {canEdit && !editing && <button className="secondaryButton" onClick={() => setEditing(true)}>Edit Schedule</button>}
          {canEdit && editing && <>
            <button className="secondaryButton" onClick={addRow}>Add Row</button>
            <button className="primaryButton" onClick={saveSchedule}>Save Changes</button>
          </>}
        </div>
      </div>

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
            {rows.map(row => (
              <tr key={row.id}>
                {(['priority','job','model','serial','status','boom','completion','comments'] as (keyof ScheduleRow)[]).map(field => (
                  <td key={field}>
                    {editing && canEdit ? (
                      <input
                        className="scheduleInput"
                        value={String(row[field])}
                        onChange={e => updateRow(row.id, field, e.target.value)}
                        aria-label={`${field} row ${row.id}`}
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
        Schedule editing is available to Debbie, Tammy, Chance, and Jose after sign-in.
      </p>
    </section>
  );
}

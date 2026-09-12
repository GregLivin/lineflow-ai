'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type DemoUser = { name: string; role: string; username: string };

type MaterialRequest = {
  id: string;
  assembly_line: string;
  material_type: 'Boom' | 'Hood';
  material_name: string;
  part_number: string | null;
  quantity: number;
  priority: 'Normal' | 'Urgent';
  assigned_handler: string | null;
  status: 'Requested' | 'Accepted' | 'Picked Up' | 'In Transit' | 'Delivered' | 'Confirmed';
  requested_at: string;
  accepted_at: string | null;
  picked_up_at: string | null;
  in_transit_at: string | null;
  delivered_at: string | null;
  confirmed_at: string | null;
  notes: string | null;
};

const boomParts = [
  { name: 'Base Boom', part: '0801316' },
  { name: 'Inner Mid', part: '0801317' },
  { name: 'Outer Mid', part: '0801318' },
  { name: 'Fly Boom', part: '0801319' },
  { name: 'Other Boom Material', part: '' },
];

const hoodOptions = [
  { name: 'Hood Material', part: '' },
  { name: 'Miscellaneous Hood Material', part: '' },
];

function timeLabel(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function elapsed(from: string, to?: string | null) {
  const end = to ? new Date(to).getTime() : Date.now();
  const diff = Math.max(0, end - new Date(from).getTime());
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export default function MaterialRequestFlow({ user }: { user: DemoUser }) {
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [materialType, setMaterialType] = useState<'Boom' | 'Hood'>('Boom');
  const [materialName, setMaterialName] = useState('Base Boom');
  const [partNumber, setPartNumber] = useState('0801316');
  const [quantity, setQuantity] = useState(1);
  const [priority, setPriority] = useState<'Normal' | 'Urgent'>('Normal');
  const [notes, setNotes] = useState('');

  const isLine = user.username.startsWith('line');
  const isGreg = user.username === 'greg';
  const isTristen = user.username === 'tristen';
  const isLeadership = ['tammy', 'chance', 'debbie', 'jose'].includes(user.username);
  const handler = isGreg ? 'greg' : isTristen ? 'tristen' : null;
  const lineName = isLine ? `Line ${user.username.replace('line', '')}` : null;

  async function loadRequests(showLoading = false) {
    if (showLoading) setLoading(true);

    let query = supabase
      .from('material_requests')
      .select('*')
      .order('requested_at', { ascending: false })
      .limit(100);

    if (lineName) query = query.eq('assembly_line', lineName);
    if (handler) query = query.eq('assigned_handler', handler);

    const { data, error } = await query;
    if (error) {
      setMessage('Unable to load material requests.');
    } else {
      setRequests((data ?? []) as MaterialRequest[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadRequests(true);

    const channel = supabase
      .channel(`lineflow-material-requests-${user.username}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'material_requests' }, () => loadRequests())
      .subscribe();

    const timer = window.setInterval(() => setRequests(current => [...current]), 1000);

    return () => {
      window.clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, [user.username]);

  const materialOptions = materialType === 'Boom' ? boomParts : hoodOptions;

  function chooseType(nextType: 'Boom' | 'Hood') {
    setMaterialType(nextType);
    const first = nextType === 'Boom' ? boomParts[0] : hoodOptions[0];
    setMaterialName(first.name);
    setPartNumber(first.part);
  }

  function chooseMaterial(value: string) {
    const selected = materialOptions.find(item => item.name === value);
    setMaterialName(value);
    setPartNumber(selected?.part ?? '');
  }

  async function submitRequest(event: FormEvent) {
    event.preventDefault();
    if (!lineName) return;

    setSubmitting(true);
    setMessage('');

    const { error } = await supabase.from('material_requests').insert({
      assembly_line: lineName,
      material_type: materialType,
      material_name: materialName.trim() || `${materialType} Material`,
      part_number: partNumber.trim() || null,
      quantity,
      priority,
      assigned_handler: materialType === 'Boom' ? 'greg' : 'tristen',
      status: 'Requested',
      notes: notes.trim() || null,
    });

    if (error) {
      setMessage('Request could not be sent. Please try again.');
    } else {
      setMessage(`${materialType} request sent to ${materialType === 'Boom' ? 'Greg' : 'Tristen'}.`);
      setQuantity(1);
      setPriority('Normal');
      setNotes('');
      await loadRequests();
    }

    setSubmitting(false);
  }

  async function updateStatus(request: MaterialRequest, status: MaterialRequest['status']) {
    const now = new Date().toISOString();
    const changes: Record<string, string> = { status };

    if (status === 'Accepted') changes.accepted_at = now;
    if (status === 'Picked Up') changes.picked_up_at = now;
    if (status === 'In Transit') changes.in_transit_at = now;
    if (status === 'Delivered') changes.delivered_at = now;
    if (status === 'Confirmed') changes.confirmed_at = now;

    const { error } = await supabase
      .from('material_requests')
      .update(changes)
      .eq('id', request.id);

    if (error) setMessage('Status could not be updated.');
    else await loadRequests();
  }

  const newRequests = useMemo(() => requests.filter(r => r.status === 'Requested'), [requests]);
  const activeRequests = useMemo(() => requests.filter(r => ['Accepted', 'Picked Up', 'In Transit'].includes(r.status)), [requests]);
  const deliveredRequests = useMemo(() => requests.filter(r => ['Delivered', 'Confirmed'].includes(r.status)), [requests]);

  function requestCard(request: MaterialRequest) {
    const canHandle = (isGreg && request.assigned_handler === 'greg') || (isTristen && request.assigned_handler === 'tristen');
    const canConfirm = isLine && request.assembly_line === lineName && request.status === 'Delivered';

    return (
      <article className={`requestCard ${request.priority === 'Urgent' ? 'urgentRequest' : ''}`} key={request.id}>
        <div className="requestCardTop">
          <div>
            <span className="requestLine">{request.assembly_line}</span>
            <h3>{request.material_name}</h3>
          </div>
          <span className={`priorityBadge ${request.priority === 'Urgent' ? 'priorityUrgent' : ''}`}>{request.priority}</span>
        </div>

        <div className="requestMetaGrid">
          <div><span>Part</span><strong>{request.part_number || '—'}</strong></div>
          <div><span>Qty</span><strong>{request.quantity}</strong></div>
          <div><span>Handler</span><strong>{request.assigned_handler === 'greg' ? 'Greg' : 'Tristen'}</strong></div>
          <div><span>Status</span><strong>{request.status}</strong></div>
        </div>

        {request.notes && <p className="requestNotes">{request.notes}</p>}

        <div className="requestTiming">
          <span>Requested {timeLabel(request.requested_at)}</span>
          <span>Elapsed {elapsed(request.requested_at, request.confirmed_at || request.delivered_at)}</span>
        </div>

        {canHandle && request.status === 'Requested' && <button className="primaryButton requestAction" onClick={() => updateStatus(request, 'Accepted')}>Accept Request</button>}
        {canHandle && request.status === 'Accepted' && <button className="primaryButton requestAction" onClick={() => updateStatus(request, 'Picked Up')}>Mark Picked Up</button>}
        {canHandle && request.status === 'Picked Up' && <button className="primaryButton requestAction" onClick={() => updateStatus(request, 'In Transit')}>Start Delivery / In Transit</button>}
        {canHandle && request.status === 'In Transit' && <button className="primaryButton requestAction" onClick={() => updateStatus(request, 'Delivered')}>Mark Delivered</button>}
        {canConfirm && <button className="primaryButton requestAction" onClick={() => updateStatus(request, 'Confirmed')}>Confirm Received</button>}
      </article>
    );
  }

  return (
    <section className="sectionBlock requestFlowSection">
      <div className="requestFlowHeader">
        <div>
          <p className="eyebrow">Live Material Flow</p>
          <h2>{isLine ? 'Request Material' : isGreg ? 'Boom Request Queue' : isTristen ? 'Hood Request Queue' : 'Material Request Control Board'}</h2>
          <p className="dashboardRole">Requests update live across connected devices.</p>
        </div>
        <div className="liveRequestIndicator"><span className="statusDot" /> Realtime Connected</div>
      </div>

      {message && <p className="requestMessage">{message}</p>}

      {isLine && (
        <form className="requestForm" onSubmit={submitRequest}>
          <div className="requestTypeButtons">
            <button type="button" className={materialType === 'Boom' ? 'typeButton activeTypeButton' : 'typeButton'} onClick={() => chooseType('Boom')}>Boom</button>
            <button type="button" className={materialType === 'Hood' ? 'typeButton activeTypeButton' : 'typeButton'} onClick={() => chooseType('Hood')}>Hood</button>
          </div>

          <div className="requestFormGrid">
            <label>Material
              <select value={materialName} onChange={e => chooseMaterial(e.target.value)}>
                {materialOptions.map(item => <option key={item.name} value={item.name}>{item.name}</option>)}
              </select>
            </label>
            <label>Part Number
              <input value={partNumber} onChange={e => setPartNumber(e.target.value)} placeholder="Optional" />
            </label>
            <label>Quantity
              <input type="number" min="1" value={quantity} onChange={e => setQuantity(Math.max(1, Number(e.target.value) || 1))} />
            </label>
            <label>Priority
              <select value={priority} onChange={e => setPriority(e.target.value as 'Normal' | 'Urgent')}>
                <option>Normal</option>
                <option>Urgent</option>
              </select>
            </label>
          </div>

          <label className="notesLabel">Notes
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional instructions, location, model, or issue" />
          </label>

          <div className="requestSubmitRow">
            <div>
              <span>Destination</span>
              <strong>{lineName}</strong>
            </div>
            <div>
              <span>Routes To</span>
              <strong>{materialType === 'Boom' ? 'Greg · Combi Lift' : 'Tristen · Forklift'}</strong>
            </div>
            <button className="primaryButton" disabled={submitting}>{submitting ? 'Sending...' : 'Send Material Request'}</button>
          </div>
        </form>
      )}

      {loading ? <p className="dashboardRole">Loading live requests...</p> : (
        <>
          {(isGreg || isTristen) && (
            <div className="requestColumns">
              <div><h3 className="queueTitle">Needs Action <span>{newRequests.length}</span></h3>{newRequests.length ? newRequests.map(requestCard) : <p className="emptyQueue">No new requests.</p>}</div>
              <div><h3 className="queueTitle">Active <span>{activeRequests.length}</span></h3>{activeRequests.length ? activeRequests.map(requestCard) : <p className="emptyQueue">No active deliveries.</p>}</div>
              <div><h3 className="queueTitle">Delivered Today <span>{deliveredRequests.length}</span></h3>{deliveredRequests.length ? deliveredRequests.map(requestCard) : <p className="emptyQueue">No completed deliveries yet.</p>}</div>
            </div>
          )}

          {isLine && (
            <div className="lineRequestList">
              <h3 className="queueTitle">Your Requests <span>{requests.length}</span></h3>
              {requests.length ? requests.map(requestCard) : <p className="emptyQueue">No requests yet. Send the first request above.</p>}
            </div>
          )}

          {isLeadership && (
            <div className="lineRequestList">
              <h3 className="queueTitle">All Live Requests <span>{requests.length}</span></h3>
              {requests.length ? requests.map(requestCard) : <p className="emptyQueue">No material requests yet.</p>}
            </div>
          )}
        </>
      )}
    </section>
  );
}

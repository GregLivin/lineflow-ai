'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type DemoUser = { name: string; role: string; username: string };

type RequestPart = {
  id: string;
  request_id: string;
  part_name: string;
  part_number: string | null;
  quantity: number;
  location: string | null;
  delivered: boolean;
  delivered_at: string | null;
  delivered_by: string | null;
};

type MaterialRequest = {
  id: string;
  assembly_line: string;
  material_type: 'Boom' | 'Hood';
  material_name: string;
  model: string | null;
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
  request_parts?: RequestPart[];
};

type ModelPart = {
  id: string;
  model: string;
  material_type: string;
  part_name: string;
  part_number: string | null;
  quantity: number;
  location: string | null;
};

const models = ['600S', '800S', '1200SJP', '1500SJ'];

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
  const [model, setModel] = useState('1500SJ');
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
      .select('*, request_parts(*)')
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

    const requestChannel = supabase
      .channel(`lineflow-material-requests-${user.username}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'material_requests' }, () => loadRequests())
      .subscribe();

    const partChannel = supabase
      .channel(`lineflow-request-parts-${user.username}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'request_parts' }, () => loadRequests())
      .subscribe();

    const timer = window.setInterval(() => setRequests(current => [...current]), 1000);

    return () => {
      window.clearInterval(timer);
      supabase.removeChannel(requestChannel);
      supabase.removeChannel(partChannel);
    };
  }, [user.username]);

  async function submitRequest(event: FormEvent) {
    event.preventDefault();
    if (!lineName) return;

    setSubmitting(true);
    setMessage('');

    const assignedHandler = materialType === 'Boom' ? 'greg' : 'tristen';
    const { data: created, error } = await supabase
      .from('material_requests')
      .insert({
        assembly_line: lineName,
        material_type: materialType,
        material_name: `${model} ${materialType} Material`,
        model,
        part_number: null,
        quantity,
        priority,
        assigned_handler: assignedHandler,
        status: 'Requested',
        notes: notes.trim() || null,
      })
      .select('id')
      .single();

    if (error || !created) {
      setMessage('Request could not be sent. Please try again.');
      setSubmitting(false);
      return;
    }

    const { data: modelParts, error: partsError } = await supabase
      .from('model_parts')
      .select('id, model, material_type, part_name, part_number, quantity, location')
      .eq('model', model)
      .eq('material_type', materialType)
      .eq('active', true)
      .order('part_name');

    if (!partsError && modelParts && modelParts.length > 0) {
      const partsPayload = (modelParts as ModelPart[]).map(part => ({
        request_id: created.id,
        part_name: part.part_name,
        part_number: part.part_number,
        quantity: part.quantity * quantity,
        location: part.location,
      }));
      await supabase.from('request_parts').insert(partsPayload);
    }

    if (modelParts && modelParts.length > 0) {
      setMessage(`${model} request sent to ${assignedHandler === 'greg' ? 'Greg' : 'Tristen'} with ${modelParts.length} required part types.`);
    } else {
      setMessage(`${model} request sent. Its parts list still needs to be configured in LineFlow.`);
    }

    setQuantity(1);
    setPriority('Normal');
    setNotes('');
    await loadRequests();
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

    const { error } = await supabase.from('material_requests').update(changes).eq('id', request.id);
    if (error) setMessage('Status could not be updated.');
    else await loadRequests();
  }

  async function togglePartDelivered(request: MaterialRequest, part: RequestPart) {
    const delivered = !part.delivered;
    const { error } = await supabase
      .from('request_parts')
      .update({
        delivered,
        delivered_at: delivered ? new Date().toISOString() : null,
        delivered_by: delivered ? user.username : null,
      })
      .eq('id', part.id);

    if (error) {
      setMessage('Part delivery could not be updated.');
      return;
    }

    await loadRequests();
  }

  const newRequests = useMemo(() => requests.filter(r => r.status === 'Requested'), [requests]);
  const activeRequests = useMemo(() => requests.filter(r => ['Accepted', 'Picked Up', 'In Transit'].includes(r.status)), [requests]);
  const deliveredRequests = useMemo(() => requests.filter(r => ['Delivered', 'Confirmed'].includes(r.status)), [requests]);

  function requestCard(request: MaterialRequest) {
    const canHandle = (isGreg && request.assigned_handler === 'greg') || (isTristen && request.assigned_handler === 'tristen');
    const canConfirm = isLine && request.assembly_line === lineName && request.status === 'Delivered';
    const parts = request.request_parts ?? [];
    const deliveredCount = parts.filter(part => part.delivered).length;
    const allPartsDelivered = parts.length === 0 || deliveredCount === parts.length;

    return (
      <article className={`requestCard ${request.priority === 'Urgent' ? 'urgentRequest' : ''}`} key={request.id}>
        <div className="requestCardTop">
          <div>
            <span className="requestLine">{request.assembly_line}</span>
            <h3>{request.model || request.material_name}</h3>
          </div>
          <span className={`priorityBadge ${request.priority === 'Urgent' ? 'priorityUrgent' : ''}`}>{request.priority}</span>
        </div>

        <div className="requestMetaGrid">
          <div><span>Model</span><strong>{request.model || '—'}</strong></div>
          <div><span>Machines / Sets</span><strong>{request.quantity}</strong></div>
          <div><span>Handler</span><strong>{request.assigned_handler === 'greg' ? 'Greg' : 'Tristen'}</strong></div>
          <div><span>Status</span><strong>{request.status}</strong></div>
        </div>

        {parts.length > 0 ? (
          <div className="requestPartsList">
            <div className="requestPartsHeader">
              <strong>Required Parts</strong>
              <span>{deliveredCount}/{parts.length} part types delivered</span>
            </div>
            {parts.map(part => (
              <label className={`requestPartRow ${part.delivered ? 'requestPartDelivered' : ''}`} key={part.id}>
                {canHandle ? (
                  <input type="checkbox" checked={part.delivered} onChange={() => togglePartDelivered(request, part)} />
                ) : (
                  <input type="checkbox" checked={part.delivered} readOnly />
                )}
                <span className="requestPartInfo">
                  <strong>{part.part_name}</strong>
                  <small>Part #{part.part_number || 'Not set'} · Qty {part.quantity} · {part.location || 'Location not set'}</small>
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="requestNotes">Parts list for this model has not been configured yet.</p>
        )}

        {request.notes && <p className="requestNotes">{request.notes}</p>}

        <div className="requestTiming">
          <span>Requested {timeLabel(request.requested_at)}</span>
          <span>Elapsed {elapsed(request.requested_at, request.confirmed_at || request.delivered_at)}</span>
        </div>

        {canHandle && request.status === 'Requested' && <button className="primaryButton requestAction" onClick={() => updateStatus(request, 'Accepted')}>Accept Request</button>}
        {canHandle && request.status === 'Accepted' && <button className="primaryButton requestAction" onClick={() => updateStatus(request, 'Picked Up')}>Mark Picked Up</button>}
        {canHandle && request.status === 'Picked Up' && <button className="primaryButton requestAction" onClick={() => updateStatus(request, 'In Transit')}>Start Delivery / In Transit</button>}
        {canHandle && request.status === 'In Transit' && <button className="primaryButton requestAction" disabled={!allPartsDelivered} onClick={() => updateStatus(request, 'Delivered')}>{allPartsDelivered ? 'Mark Request Delivered' : 'Check Off Every Part First'}</button>}
        {canConfirm && <button className="primaryButton requestAction" onClick={() => updateStatus(request, 'Confirmed')}>Confirm Received</button>}
      </article>
    );
  }

  return (
    <section className="sectionBlock requestFlowSection">
      <div className="requestFlowHeader">
        <div>
          <p className="eyebrow">Live Material Flow</p>
          <h2>{isLine ? 'Request Material by Model' : isGreg ? 'Boom Request Queue' : isTristen ? 'Hood Request Queue' : 'Material Request Control Board'}</h2>
          <p className="dashboardRole">Line users request a machine model. LineFlow expands that request into the individual parts the handler must deliver.</p>
        </div>
        <div className="liveRequestIndicator"><span className="statusDot" /> Realtime Connected</div>
      </div>

      {message && <p className="requestMessage">{message}</p>}

      {isLine && (
        <form className="requestForm" onSubmit={submitRequest}>
          <div className="requestTypeButtons">
            <button type="button" className={materialType === 'Boom' ? 'typeButton activeTypeButton' : 'typeButton'} onClick={() => setMaterialType('Boom')}>Boom</button>
            <button type="button" className={materialType === 'Hood' ? 'typeButton activeTypeButton' : 'typeButton'} onClick={() => setMaterialType('Hood')}>Hood</button>
          </div>

          <div className="requestFormGrid">
            <label>Model
              <select value={model} onChange={e => setModel(e.target.value)}>
                {models.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label>How Many Machines / Sets
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
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional production note or special instruction" />
          </label>

          <div className="requestSubmitRow">
            <div><span>Destination</span><strong>{lineName}</strong></div>
            <div><span>Routes To</span><strong>{materialType === 'Boom' ? 'Greg · Combi Lift' : 'Tristen · Forklift'}</strong></div>
            <button className="primaryButton" disabled={submitting}>{submitting ? 'Sending...' : `Request ${model}`}</button>
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

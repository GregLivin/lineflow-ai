'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type DemoUser = { name: string; role: string; username: string };
type TeamMessage = { id:string; category:'Safety'|'Goal'|'Important'|'General'; title:string; message:string; created_by:string; created_at:string; message_date:string; active:boolean };

const supervisors = ['tammy', 'chance', 'debbie'];

export default function TeamMessageBoard({ user }: { user?: DemoUser | null }) {
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(user ?? null);
  const [category, setCategory] = useState<TeamMessage['category']>('General');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const canPost = !!currentUser && supervisors.includes(currentUser.username);
  const today = useMemo(() => new Date().toLocaleDateString('en-CA'), []);
  const latest = messages[0] ?? null;

  async function loadMessages() {
    const { data, error } = await supabase.from('team_messages').select('*').eq('active', true).order('message_date', { ascending: false }).order('created_at', { ascending: false }).limit(8);
    if (!error) setMessages((data ?? []) as TeamMessage[]);
    setLoading(false);
  }

  useEffect(() => {
    if (user) setCurrentUser(user);
    else {
      const saved = localStorage.getItem('lineflowUser');
      if (saved) { try { setCurrentUser(JSON.parse(saved)); } catch {} }
    }
    loadMessages();
    const channel = supabase.channel('lineflow-team-messages').on('postgres_changes', { event:'*', schema:'public', table:'team_messages' }, loadMessages).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  function startCreate() {
    setEditingId(null);
    setCategory('General');
    setTitle('');
    setMessage('');
    setStatus('');
    setShowEditor(true);
  }

  function startEdit(item: TeamMessage) {
    setEditingId(item.id);
    setCategory(item.category);
    setTitle(item.title);
    setMessage(item.message);
    setStatus('');
    setShowEditor(true);
  }

  async function saveMessage(event: FormEvent) {
    event.preventDefault();
    if (!canPost || !currentUser || !title.trim() || !message.trim()) return;
    setStatus(editingId ? 'Saving...' : 'Posting...');

    const payload = { category, title:title.trim(), message:message.trim(), created_by:currentUser.name, message_date:today, active:true };
    const result = editingId
      ? await supabase.from('team_messages').update(payload).eq('id', editingId)
      : await supabase.from('team_messages').insert(payload);

    if (result.error) { setStatus(editingId ? 'Message could not be updated.' : 'Message could not be posted.'); return; }
    setStatus(editingId ? 'Daily message updated.' : 'Message posted to the team homepage.');
    setEditingId(null);
    setShowEditor(false);
    setTitle('');
    setMessage('');
    await loadMessages();
  }

  async function archiveMessage(id:string) {
    if (!canPost) return;
    await supabase.from('team_messages').update({ active:false }).eq('id', id);
    await loadMessages();
  }

  return <section className="sectionBlock teamMessageBoard">
    <div className="sectionHeading" style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'flex-start',flexWrap:'wrap'}}>
      <div><p className="eyebrow">Daily Team Message</p><h2>Safety, Goals & Important Updates</h2><p className="dashboardRole">Daily messages for the whole team before sign-in.</p></div>
      {canPost && <button className="primaryButton" type="button" onClick={() => latest ? startEdit(latest) : startCreate()}>{latest ? 'Create / Edit Message' : 'Create Message'}</button>}
    </div>

    {canPost && showEditor && <form className="teamMessageForm" onSubmit={saveMessage}>
      <div className="requestFormGrid">
        <label>Category<select value={category} onChange={e=>setCategory(e.target.value as TeamMessage['category'])}><option>General</option><option>Safety</option><option>Goal</option><option>Important</option></select></label>
        <label>Title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Example: Today's Safety Focus" /></label>
      </div>
      <label className="notesLabel">Message<textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Share a safety focus, production goal, priority, reminder, or important update." /></label>
      <div className="teamMessageActions" style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
        <button className="primaryButton" type="submit">{editingId ? 'Save Changes' : 'Post to Team'}</button>
        <button className="secondaryButton" type="button" onClick={()=>{setShowEditor(false);setEditingId(null);setStatus('')}}>Cancel</button>
        {status && <span className="dashboardRole">{status}</span>}
      </div>
    </form>}

    <div className="teamMessageList">
      {loading ? <p className="dashboardRole">Loading team messages...</p> : messages.length===0 ? <article className="teamMessageCard"><span className="teamMessageBadge">General</span><h3>No daily message posted yet.</h3><p>Supervisor updates will appear here.</p></article> : messages.map((item,index) => <article className="teamMessageCard" key={item.id}><div className="teamMessageTop"><span className={`teamMessageBadge teamMessage${item.category}`}>{item.category}</span><span className="teamMessageDate">{new Date(`${item.message_date}T12:00:00`).toLocaleDateString([], {month:'short',day:'numeric'})}</span></div><h3>{item.title}</h3><p>{item.message}</p><div className="teamMessageFooter"><span>Posted by {item.created_by}</span>{canPost && <div style={{display:'flex',gap:8}}>{index===0&&<button type="button" className="secondaryButton" onClick={()=>startEdit(item)}>Edit</button>}<button type="button" className="messageArchiveButton" onClick={()=>archiveMessage(item.id)}>Archive</button></div>}</div></article>)}
    </div>
  </section>;
}

'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type DemoUser = { name: string; role: string; username: string };
type TeamMessage = {
  id: string;
  category: 'Safety' | 'Goal' | 'Important' | 'General';
  title: string;
  message: string;
  created_by: string;
  created_at: string;
  message_date: string;
  active: boolean;
};

const supervisors = ['tammy', 'chance', 'debbie', 'jose'];

export default function TeamMessageBoard({ user }: { user?: DemoUser | null }) {
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [category, setCategory] = useState<TeamMessage['category']>('Safety');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const canPost = !!user && supervisors.includes(user.username);
  const today = useMemo(() => new Date().toLocaleDateString('en-CA'), []);

  async function loadMessages() {
    const { data, error } = await supabase
      .from('team_messages')
      .select('id, category, title, message, created_by, created_at, message_date, active')
      .eq('active', true)
      .order('message_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(8);

    if (!error) setMessages((data ?? []) as TeamMessage[]);
    setLoading(false);
  }

  useEffect(() => {
    loadMessages();
    const channel = supabase
      .channel('lineflow-team-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_messages' }, () => loadMessages())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function postMessage(event: FormEvent) {
    event.preventDefault();
    if (!canPost || !title.trim() || !message.trim()) return;

    setStatus('Posting...');
    const { error } = await supabase.from('team_messages').insert({
      category,
      title: title.trim(),
      message: message.trim(),
      created_by: user!.name,
      message_date: today,
      active: true,
    });

    if (error) {
      setStatus('Message could not be posted.');
      return;
    }

    setTitle('');
    setMessage('');
    setStatus('Message posted to the team homepage.');
    await loadMessages();
  }

  async function archiveMessage(id: string) {
    if (!canPost) return;
    await supabase.from('team_messages').update({ active: false }).eq('id', id);
    await loadMessages();
  }

  return (
    <section className="sectionBlock teamMessageBoard">
      <div className="sectionHeading">
        <div>
          <p className="eyebrow">Daily Team Message</p>
          <h2>Safety, Goals & Important Updates</h2>
          <p className="dashboardRole">Supervisors can post daily team messages that appear here for everyone before they sign in.</p>
        </div>
      </div>

      {canPost && (
        <form className="teamMessageForm" onSubmit={postMessage}>
          <div className="requestFormGrid">
            <label>Category
              <select value={category} onChange={e => setCategory(e.target.value as TeamMessage['category'])}>
                <option>Safety</option><option>Goal</option><option>Important</option><option>General</option>
              </select>
            </label>
            <label>Title
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Example: Today's Safety Focus" />
            </label>
          </div>
          <label className="notesLabel">Message
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Share the safety focus, production goal, priority, reminder, or other important team update." />
          </label>
          <div className="teamMessageActions">
            <button className="primaryButton" type="submit">Post to Team</button>
            {status && <span className="dashboardRole">{status}</span>}
          </div>
        </form>
      )}

      <div className="teamMessageList">
        {loading ? <p className="dashboardRole">Loading team messages...</p> : messages.length === 0 ? (
          <article className="teamMessageCard"><span className="teamMessageBadge">General</span><h3>No daily message posted yet.</h3><p>Supervisor updates will appear here.</p></article>
        ) : messages.map(item => (
          <article className="teamMessageCard" key={item.id}>
            <div className="teamMessageTop">
              <span className={`teamMessageBadge teamMessage${item.category}`}>{item.category}</span>
              <span className="teamMessageDate">{new Date(`${item.message_date}T12:00:00`).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.message}</p>
            <div className="teamMessageFooter"><span>Posted by {item.created_by}</span>{canPost && <button type="button" className="messageArchiveButton" onClick={() => archiveMessage(item.id)}>Archive</button>}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

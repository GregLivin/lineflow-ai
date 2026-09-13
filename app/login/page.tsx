'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const demoUsers: Record<string, { name: string; role: string; group: string }> = {
  greg: { name: 'Greg', role: 'Boom Material Handler / Combi Lift', group: 'handler' },
  tristen: { name: 'Tristen', role: 'Hood Material Handler / Forklift', group: 'handler' },
  debbie: { name: 'Debbie', role: 'Planner / System Administrator', group: 'supervisor' },
  tammy: { name: 'Tammy', role: 'Operations Leadership / System Administrator', group: 'supervisor' },
  chance: { name: 'Chance', role: 'Houston Supervisor / System Administrator', group: 'supervisor' },
  jose: { name: 'Jose', role: 'Boom Line Material Specialist', group: 'specialist' },
  line1: { name: 'Line 1', role: 'Assembly Line User', group: 'line' },
  line2: { name: 'Line 2', role: 'Assembly Line User', group: 'line' },
  line3: { name: 'Line 3', role: 'Assembly Line User', group: 'line' },
  line4: { name: 'Line 4', role: 'Assembly Line User', group: 'line' },
};

const roleInfo: Record<string, { title: string; subtitle: string }> = {
  line: { title: 'Line User Login', subtitle: 'Request material and track delivery from your assembly line.' },
  handler: { title: 'Material Handler Login', subtitle: 'Accept requests, locate parts, and update delivery status.' },
  supervisor: { title: 'Supervisor / Planner Login', subtitle: 'Monitor production, requests, handlers, priorities, and inventory.' },
  specialist: { title: 'Boom Line Material Specialist Login', subtitle: 'Manage boom-line readiness, shortages, staging, and production support.' },
};

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const role = new URLSearchParams(window.location.search).get('role') || '';
    setSelectedRole(roleInfo[role] ? role : '');
  }, []);

  const selectedRoleInfo = roleInfo[selectedRole];
  const quickUsers = useMemo(() => {
    const entries = Object.entries(demoUsers);
    return selectedRole ? entries.filter(([, user]) => user.group === selectedRole) : entries;
  }, [selectedRole]);

  function signInAs(key: string) {
    const user = demoUsers[key];
    if (!user) return;
    localStorage.setItem('lineflowUser', JSON.stringify({ ...user, username: key }));
    router.push('/dashboard');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const key = username.trim().toLowerCase().replace(/\s+/g, '');
    const user = demoUsers[key];

    if (!user || password !== '12345') {
      setError('Invalid username or password.');
      return;
    }

    if (selectedRole && user.group !== selectedRole) {
      setError('This account belongs to a different LineFlow role. Choose one of the users shown above.');
      return;
    }

    localStorage.setItem('lineflowUser', JSON.stringify({ ...user, username: key }));
    router.push('/dashboard');
  }

  return (
    <main className="shell authShell">
      <section className="authCard" style={{ width: 'min(720px, 100%)' }}>
        <div className="brandRow">
          <div className="logoMark">LF</div>
          <div>
            <p className="eyebrow">Secure Demo Access</p>
            <h1 className="authTitle">{selectedRoleInfo?.title || 'Sign in to LineFlow AI'}</h1>
          </div>
        </div>

        <p className="authCopy">
          {selectedRoleInfo?.subtitle || 'Select a demo user or sign in with an assigned LineFlow account.'}
        </p>

        <div style={{ padding: 18, border: '1px solid rgba(148, 163, 184, 0.18)', borderRadius: 18, background: '#0b1728', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
            <div>
              <p className="eyebrow">Quick Demo Access</p>
              <h2 style={{ marginBottom: 0, fontSize: '1.35rem' }}>Choose a user</h2>
            </div>
            {selectedRole ? <button className="secondaryButton" type="button" onClick={() => { setSelectedRole(''); router.replace('/login'); }}>View all roles</button> : null}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
            {quickUsers.map(([key, user]) => (
              <button
                type="button"
                key={key}
                onClick={() => signInAs(key)}
                style={{
                  minHeight: 118,
                  padding: 15,
                  textAlign: 'left',
                  borderRadius: 14,
                  border: '1px solid rgba(148, 163, 184, 0.18)',
                  background: '#15243a',
                  color: '#f8fafc',
                  cursor: 'pointer',
                }}
              >
                <strong style={{ display: 'block', fontSize: '1.05rem', marginBottom: 7 }}>{user.name}</strong>
                <span style={{ display: 'block', color: '#94a3b8', lineHeight: 1.4, minHeight: 40 }}>{user.role}</span>
                <small style={{ display: 'block', color: '#38bdf8', fontWeight: 800, marginTop: 9 }}>Enter Demo →</small>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0', color: '#94a3b8', fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 800 }}>
          <span style={{ height: 1, background: 'rgba(148, 163, 184, 0.18)', flex: 1 }} />
          <span>or use credentials</span>
          <span style={{ height: 1, background: 'rgba(148, 163, 184, 0.18)', flex: 1 }} />
        </div>

        <form className="loginForm" onSubmit={handleSubmit}>
          <label>
            Username
            <input autoComplete="username" value={username} onChange={(event) => { setUsername(event.target.value); setError(''); }} placeholder="Greg, Debbie, Jose, Line1..." />
          </label>
          <label>
            Password
            <input type="password" autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} placeholder="Enter password" />
          </label>
          {error ? <p className="formError">{error}</p> : null}
          <button className="primaryButton fullButton" type="submit">Sign In</button>
        </form>

        <p className="demoNote">Demo password for all current accounts: <strong>12345</strong>. Quick Demo Access signs directly into the selected user view.</p>
      </section>
    </main>
  );
}

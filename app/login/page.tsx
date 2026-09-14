'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type DemoAccount = { name: string; role: string; group: string; internalUsername: string };

const users: Record<string, DemoAccount> = {
  tammy: { name: 'Operations Leadership', role: 'Operations Leadership / System Administrator', group: 'supervisor', internalUsername: 'tammy' },
  chance: { name: 'Houston Supervisor', role: 'Houston Supervisor / System Administrator', group: 'supervisor', internalUsername: 'chance' },
  planner: { name: 'Planner', role: 'Planner / System Administrator', group: 'supervisor', internalUsername: 'debbie' },
  jose: { name: 'Boom Line Material Specialist', role: 'Boom Line Material Specialist', group: 'specialist', internalUsername: 'jose' },
  greg: { name: 'Boom Material Handler', role: 'Boom Material Handler / Combi Lift', group: 'handler', internalUsername: 'greg' },
  storm: { name: 'Hood Material Handler', role: 'Hood Material Handler / Forklift', group: 'handler', internalUsername: 'tristen' },
  tristen: { name: 'Hood Material Handler', role: 'Hood Material Handler / Forklift', group: 'handler', internalUsername: 'tristen' },
  mike: { name: 'Mike', role: 'Assembly Line User', group: 'line', internalUsername: 'line1' },
  line2: { name: 'Line 2', role: 'Assembly Line User', group: 'line', internalUsername: 'line2' },
  line3: { name: 'Line 3', role: 'Assembly Line User', group: 'line', internalUsername: 'line3' },
  line4: { name: 'Line 4', role: 'Assembly Line User', group: 'line', internalUsername: 'line4' },
};

const roleInfo: Record<string, { title: string; subtitle: string }> = {
  line: { title: 'Line User Login', subtitle: 'Request material and track delivery from your assembly line.' },
  handler: { title: 'Material Handler Login', subtitle: 'Receive assigned requests and update delivery status.' },
  supervisor: { title: 'Supervisor / Planner Login', subtitle: 'Monitor production, requests, priorities, and inventory.' },
  specialist: { title: 'Boom Line Material Specialist Login', subtitle: 'Manage boom-line material readiness and production support.' },
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const key = username.trim().toLowerCase().replace(/\s+/g, '');
    const user = users[key];
    if (!user || password !== '12345') { setError('Invalid demo username or password.'); return; }
    if (selectedRole && user.group !== selectedRole) {
      setError('This account does not have access to the selected role.');
      return;
    }
    localStorage.setItem('lineflowUser', JSON.stringify({ name: user.name, role: user.role, group: user.group, username: user.internalUsername }));
    router.push('/dashboard');
  }

  return (
    <main className="shell authShell">
      <section className="authCard">
        <div className="brandRow"><div className="logoMark">LF</div><div><p className="eyebrow">LineFlow AI · Demo</p><h1 className="authTitle">{selectedRoleInfo?.title || 'Sign In'}</h1></div></div>
        <p className="authCopy">{selectedRoleInfo?.subtitle || 'Enter a role-based demo username and the shared password to continue.'}</p>
        <form className="loginForm" onSubmit={handleSubmit}>
          <label>Username<input autoComplete="username" value={username} onChange={e => { setUsername(e.target.value); setError(''); }} placeholder="Enter role username" /></label>
          <label>Password<input type="password" autoComplete="current-password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="12345" /></label>
          {error ? <p className="formError">{error}</p> : null}
          <button className="primaryButton fullButton" type="submit">Sign In</button>
        </form>
        <p className="authCopy" style={{ marginTop: 12, fontSize: '0.86rem', lineHeight: 1.6 }}>
          <strong>Demo usernames:</strong> tammy · chance · planner · jose · greg · storm · tristen · mike · line2 · line3 · line4
        </p>
        <p className="authCopy" style={{ marginTop: 4 }}>Demo password for all accounts: <strong>12345</strong></p>
        <div className="actions"><button className="secondaryButton fullButton" type="button" onClick={() => router.push('/')}>Back to Home</button></div>
      </section>
    </main>
  );
}

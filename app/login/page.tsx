'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const users: Record<string, { name: string; role: string; group: string }> = {
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
    if (!user || !password) { setError('Invalid username or password.'); return; }
    if (selectedRole && user.group !== selectedRole) {
      setError('This account does not have access to the selected role. Return home and choose the correct role.');
      return;
    }
    localStorage.setItem('lineflowUser', JSON.stringify({ ...user, username: key }));
    router.push('/dashboard');
  }

  return (
    <main className="shell authShell">
      <section className="authCard">
        <div className="brandRow"><div className="logoMark">LF</div><div><p className="eyebrow">LineFlow AI</p><h1 className="authTitle">{selectedRoleInfo?.title || 'Sign In'}</h1></div></div>
        <p className="authCopy">{selectedRoleInfo?.subtitle || 'Enter your assigned LineFlow username and password to continue.'}</p>
        <form className="loginForm" onSubmit={handleSubmit}>
          <label>Username<input autoComplete="username" value={username} onChange={e => { setUsername(e.target.value); setError(''); }} placeholder="Enter username" /></label>
          <label>Password<input type="password" autoComplete="current-password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="Enter password" /></label>
          {error ? <p className="formError">{error}</p> : null}
          <button className="primaryButton fullButton" type="submit">Sign In</button>
        </form>
        <div className="actions"><button className="secondaryButton fullButton" type="button" onClick={() => router.push('/')}>Back to Home</button></div>
      </section>
    </main>
  );
}

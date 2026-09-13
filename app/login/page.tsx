'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
  const searchParams = useSearchParams();
  const selectedRole = searchParams.get('role') || '';
  const selectedRoleInfo = roleInfo[selectedRole];

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
      setError(`This account belongs to a different LineFlow role. Choose one of the ${selectedRoleInfo?.title || 'selected role'} accounts below.`);
      return;
    }

    localStorage.setItem('lineflowUser', JSON.stringify({ ...user, username: key }));
    router.push('/dashboard');
  }

  return (
    <main className="shell authShell">
      <section className="authCard">
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

        <div className="quickLoginBlock">
          <div className="quickLoginHeader">
            <div>
              <p className="eyebrow">Quick Demo Access</p>
              <h2>Choose a user</h2>
            </div>
            {selectedRole ? <button className="secondaryButton" type="button" onClick={() => router.push('/login')}>View all roles</button> : null}
          </div>

          <div className="quickLoginGrid">
            {quickUsers.map(([key, user]) => (
              <button className="quickLoginCard" type="button" key={key} onClick={() => signInAs(key)}>
                <strong>{user.name}</strong>
                <span>{user.role}</span>
                <small>Enter Demo →</small>
              </button>
            ))}
          </div>
        </div>

        <div className="loginDivider"><span>or use credentials</span></div>

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

        <p className="demoNote">Demo password for all current accounts: <strong>12345</strong>. Quick Demo Access does not require typing the password.</p>
      </section>
    </main>
  );
}

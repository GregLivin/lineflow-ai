'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const demoUsers: Record<string, { name: string; role: string }> = {
  greg: { name: 'Greg', role: 'Boom Material Handler / Combi Lift' },
  tristen: { name: 'Tristen', role: 'Hood Material Handler / Forklift' },
  debbie: { name: 'Debbie', role: 'Planner / System Administrator' },
  tammy: { name: 'Tammy', role: 'Operations Leadership / System Administrator' },
  chance: { name: 'Chance', role: 'Houston Supervisor / System Administrator' },
  jose: { name: 'Jose', role: 'Boom Line Material Specialist' },
  line1: { name: 'Line 1', role: 'Assembly Line User' },
  line2: { name: 'Line 2', role: 'Assembly Line User' },
  line3: { name: 'Line 3', role: 'Assembly Line User' },
  line4: { name: 'Line 4', role: 'Assembly Line User' },
};

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const key = username.trim().toLowerCase().replace(/\s+/g, '');
    const user = demoUsers[key];

    if (!user || password !== '12345') {
      setError('Invalid username or password.');
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
            <h1 className="authTitle">Sign in to LineFlow AI</h1>
          </div>
        </div>

        <p className="authCopy">Use your assigned LineFlow demo username and password.</p>

        <form className="loginForm" onSubmit={handleSubmit}>
          <label>Username<input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Greg, Debbie, Jose, Line1..." /></label>
          <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" /></label>
          {error ? <p className="formError">{error}</p> : null}
          <button className="primaryButton fullButton" type="submit">Sign In</button>
        </form>
        <p className="demoNote">Demo password for all current accounts: <strong>12345</strong></p>
      </section>
    </main>
  );
}

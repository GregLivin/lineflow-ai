import Link from 'next/link';
import LiveClock from '../components/LiveClock';
import ProductionSchedule from '../components/ProductionSchedule';
import TeamMessageBoard from '../components/TeamMessageBoard';

const roles = [
  { title: 'Line User', text: 'Request material and track delivery.' },
  { title: 'Material Handler', text: 'Accept requests and deliver material.' },
  { title: 'Supervisor / Planner', text: 'Monitor inventory, yard activity, and goals.' },
  { title: 'Boom Material Specialist', text: 'Monitor boom material readiness and shortages.' },
];

export default function Home() {
  return (
    <main className="shell homeShell">
      <section className="hero operationsHero" style={{ padding: '18px 22px' }}>
        <div className="heroTopRow" style={{ alignItems: 'center', gap: 18 }}>
          <div className="brandRow">
            <div className="logoMark">LF</div>
            <div><p className="eyebrow">Production Operations System</p><h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}>LineFlow AI</h1></div>
          </div>
          <LiveClock />
        </div>

        <div className="operationsStatusRow" style={{ marginTop: 14, gap: '8px 14px' }}>
          <div className="statusStrip" style={{ padding: '7px 11px' }}><span className="statusDot" /><span>Production System Online</span></div>
          <span className="systemMeta">Material flow · inventory · planning · delivery</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
          <p className="heroCopy compactHeroCopy" style={{ margin: 0, fontSize: '1rem', lineHeight: 1.45, maxWidth: 690 }}>Material requests, production planning, inventory visibility, and delivery across all four assembly lines.</p>
          <div className="actions homeActions" style={{ margin: 0 }}>
            <Link className="primaryButton linkButton" href="/login">Sign In</Link>
          </div>
        </div>
      </section>

      <TeamMessageBoard />
      <ProductionSchedule />

      <section className="sectionBlock quickGuideBlock" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <p className="eyebrow" style={{ margin: 0 }}>How LineFlow Works</p>
          <h2 style={{ fontSize: '1.35rem', margin: 0 }}>One system. Role-based access.</h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '.9rem' }}>Your position determines the tools and information you can access.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 8 }}>
          {roles.map(role => (
            <article key={role.title} style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--panel-2)' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '1rem' }}>{role.title}</h3>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '.82rem', lineHeight: 1.35 }}>{role.text}</p>
            </article>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          <span className="eyebrow" style={{ margin: 0 }}>Material Flow</span>
          <strong style={{ fontSize: '.92rem' }}>Request → Accept → Deliver</strong>
        </div>
      </section>
    </main>
  );
}

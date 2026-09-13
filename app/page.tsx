import Link from 'next/link';
import LiveClock from '../components/LiveClock';
import ProductionSchedule from '../components/ProductionSchedule';
import TeamMessageBoard from '../components/TeamMessageBoard';

const demoUsers = [
  ['Tammy', 'tammy', 'Operations Leadership'],
  ['Chance', 'chance', 'Houston Supervisor'],
  ['Debbie', 'debbie', 'Planner'],
  ['Jose', 'jose', 'Boom Material Specialist'],
  ['Greg', 'greg', 'Boom Material Handler'],
  ['Tristen', 'tristen', 'Hood Material Handler'],
  ['Line 1', 'line1', 'Assembly Line User'],
  ['Line 2', 'line2', 'Assembly Line User'],
  ['Line 3', 'line3', 'Assembly Line User'],
  ['Line 4', 'line4', 'Assembly Line User'],
];

export default function Home() {
  return (
    <main className="shell homeShell">
      <style>{`
        .clockMobileCompact { display: none; }
        .demoLoginGrid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; margin-top:14px; }
        .demoLoginRow { display:grid; grid-template-columns:1fr 1fr 1.5fr; gap:10px; padding:10px 12px; border:1px solid var(--border); border-radius:10px; background:rgba(255,255,255,.02); font-size:.82rem; }
        .demoLoginRow strong { color:var(--text); }
        .demoLoginRow span { color:var(--muted); }
        .demoPassword { margin-top:12px; color:var(--muted); font-size:.86rem; }
        .demoPassword strong { color:var(--text); }

        @media (max-width: 680px) {
          .homeHeroCompact { padding: 14px 16px !important; }
          .homeHeroCompact .heroTopRow { flex-direction: column !important; align-items: stretch !important; gap: 10px !important; }
          .homeHeroCompact .brandRow { gap: 10px; align-items: center; }
          .homeHeroCompact .logoMark { width:44px; height:44px; border-radius:14px; font-size:.8rem; flex:0 0 auto; }
          .homeHeroCompact .eyebrow { font-size:.58rem; margin-bottom:2px; }
          .homeHeroCompact h1 { font-size:1.8rem !important; }
          .homeHeroCompact .liveClock { width:100%; min-width:0; padding:8px 12px; border-radius:12px; text-align:left; }
          .homeHeroCompact .clockDesktop { display:none; }
          .homeHeroCompact .clockMobileCompact { display:flex; align-items:center; justify-content:space-between; gap:8px; color:var(--muted); font-size:.76rem; }
          .homeHeroCompact .clockMobileCompact strong { color:var(--text); font-size:.95rem; }
          .homeHeroCompact .operationsStatusRow { margin-top:10px !important; }
          .homeHeroCompact .systemMeta { font-size:.72rem; line-height:1.35; }
          .homeHeroCompact .heroBottomRow { margin-top:8px !important; gap:10px !important; align-items:center !important; justify-content:flex-end !important; }
          .homeHeroCompact .homeActions { width:auto !important; flex:0 0 auto; }
          .homeHeroCompact .homeActions .primaryButton { width:auto !important; min-height:38px; padding:0 18px; border-radius:11px; }
          .homeShell > .teamMessageBoard, .homeShell > .scheduleSection { margin-top:12px; }
          .homeShell > .teamMessageBoard { padding:14px 16px !important; }
          .demoLoginGrid { grid-template-columns:1fr; }
          .demoLoginRow { grid-template-columns:.8fr .8fr 1.4fr; font-size:.75rem; }
        }
      `}</style>

      <section className="hero operationsHero homeHeroCompact" style={{ padding: '18px 22px' }}>
        <div className="heroTopRow" style={{ alignItems: 'center', gap: 18 }}>
          <div className="brandRow"><div className="logoMark">LF</div><div><p className="eyebrow">Production Operations System</p><h1 style={{ fontSize:'clamp(2rem, 5vw, 3.25rem)' }}>LineFlow AI</h1></div></div>
          <LiveClock />
        </div>
        <div className="operationsStatusRow" style={{ marginTop:14 }}><span className="systemMeta">Production Visibility · Material Flow · Inventory · Delivery</span></div>
        <div className="heroBottomRow" style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:16, flexWrap:'wrap', marginTop:12 }}>
          <div className="actions homeActions" style={{ margin:0 }}><Link className="primaryButton linkButton" href="/login">Sign In</Link></div>
        </div>
      </section>

      <section className="sectionBlock">
        <div className="sectionHeading"><div>
          <p className="eyebrow">Demo Access</p>
          <h2>Explore LineFlow by Role</h2>
          <p className="dashboardRole">Choose any demo account below to see the tools and workflow for that position.</p>
        </div></div>
        <div className="demoLoginGrid">
          {demoUsers.map(([name,username,role])=><div className="demoLoginRow" key={username}><strong>{name}</strong><span>{username}</span><span>{role}</span></div>)}
        </div>
        <p className="demoPassword">Password for all demo accounts: <strong>demo</strong></p>
        <div className="actions" style={{marginTop:12}}><Link className="primaryButton linkButton" href="/login">Open Demo Login</Link></div>
      </section>

      <TeamMessageBoard />
      <ProductionSchedule />
    </main>
  );
}

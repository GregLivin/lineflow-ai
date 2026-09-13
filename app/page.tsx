import Link from 'next/link';
import LiveClock from '../components/LiveClock';
import ProductionSchedule from '../components/ProductionSchedule';
import TeamMessageBoard from '../components/TeamMessageBoard';

export default function Home() {
  return (
    <main className="shell homeShell">
      <style>{`
        .clockMobileCompact { display: none; }
        .demoAccessFooter { margin:14px 0 4px; padding:10px 14px; border-top:1px solid var(--border); color:var(--muted); font-size:.72rem; line-height:1.5; text-align:center; }
        .demoAccessFooter strong { color:var(--text); }

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
          .demoAccessFooter { font-size:.65rem; padding:9px 8px; }
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

      <TeamMessageBoard />
      <ProductionSchedule />

      <div className="demoAccessFooter">
        <strong>Demo login example:</strong> Username: <strong>tammy</strong> · Password: <strong>12345</strong> for every user
      </div>
    </main>
  );
}

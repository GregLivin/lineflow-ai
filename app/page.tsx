import Link from 'next/link';
import LiveClock from '../components/LiveClock';
import ProductionSchedule from '../components/ProductionSchedule';
import TeamMessageBoard from '../components/TeamMessageBoard';

const roles = [
  { title: 'Line User', text: 'Request & track material.' },
  { title: 'Material Handler', text: 'Accept & deliver material.' },
  { title: 'Supervisor / Planner', text: 'Inventory, yard & goals.' },
  { title: 'Boom Material Specialist', text: 'Boom readiness & shortages.' },
];

export default function Home() {
  return (
    <main className="shell homeShell">
      <style>{`
        .clockMobileCompact { display: none; }

        @media (max-width: 680px) {
          .homeHeroCompact {
            padding: 14px 16px !important;
          }

          .homeHeroCompact .heroTopRow {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }

          .homeHeroCompact .brandRow {
            gap: 10px;
            align-items: center;
          }

          .homeHeroCompact .logoMark {
            width: 44px;
            height: 44px;
            border-radius: 14px;
            font-size: .8rem;
            flex: 0 0 auto;
          }

          .homeHeroCompact .eyebrow {
            font-size: .58rem;
            margin-bottom: 2px;
          }

          .homeHeroCompact h1 {
            font-size: 1.8rem !important;
          }

          .homeHeroCompact .liveClock {
            width: 100%;
            min-width: 0;
            padding: 8px 12px;
            border-radius: 12px;
            text-align: left;
          }

          .homeHeroCompact .clockDesktop {
            display: none;
          }

          .homeHeroCompact .clockMobileCompact {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            color: var(--muted);
            font-size: .76rem;
          }

          .homeHeroCompact .clockMobileCompact strong {
            color: var(--text);
            font-size: .95rem;
          }

          .homeHeroCompact .operationsStatusRow {
            margin-top: 10px !important;
          }

          .homeHeroCompact .systemMeta {
            font-size: .72rem;
          }

          .homeHeroCompact .heroBottomRow {
            margin-top: 8px !important;
            gap: 10px !important;
            align-items: center !important;
          }

          .homeHeroCompact .compactHeroCopy {
            font-size: .82rem !important;
            line-height: 1.35 !important;
            max-width: none !important;
            flex: 1 1 220px;
          }

          .homeHeroCompact .homeActions {
            width: auto !important;
            flex: 0 0 auto;
          }

          .homeHeroCompact .homeActions .primaryButton {
            width: auto !important;
            min-height: 38px;
            padding: 0 16px;
            border-radius: 11px;
          }

          .mobileGuideCompact {
            padding: 12px 14px !important;
          }

          .mobileGuideCompact .guideIntro {
            display: block !important;
            margin-bottom: 9px !important;
          }

          .mobileGuideCompact .guideIntro .eyebrow {
            margin-bottom: 4px !important;
            font-size: .58rem;
          }

          .mobileGuideCompact .guideIntro h2 {
            font-size: 1.05rem !important;
            margin-bottom: 4px !important;
          }

          .mobileGuideCompact .guideIntro p {
            font-size: .75rem !important;
            line-height: 1.3;
          }

          .mobileGuideCompact .roleMobileGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 6px !important;
          }

          .mobileGuideCompact .roleMobileCard {
            padding: 8px 9px !important;
            border-radius: 10px !important;
          }

          .mobileGuideCompact .roleMobileCard h3 {
            font-size: .78rem !important;
            margin-bottom: 2px !important;
          }

          .mobileGuideCompact .roleMobileCard p {
            font-size: .68rem !important;
            line-height: 1.25 !important;
          }

          .mobileGuideCompact .materialFlowCompact {
            margin-top: 8px !important;
            padding-top: 8px !important;
            gap: 7px !important;
          }

          .mobileGuideCompact .materialFlowCompact .eyebrow {
            font-size: .56rem;
          }

          .mobileGuideCompact .materialFlowCompact strong {
            font-size: .75rem !important;
          }
        }
      `}</style>

      <section className="hero operationsHero homeHeroCompact" style={{ padding: '18px 22px' }}>
        <div className="heroTopRow" style={{ alignItems: 'center', gap: 18 }}>
          <div className="brandRow">
            <div className="logoMark">LF</div>
            <div><p className="eyebrow">Production Operations System</p><h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}>LineFlow AI</h1></div>
          </div>
          <LiveClock />
        </div>

        <div className="operationsStatusRow" style={{ marginTop: 14 }}>
          <span className="systemMeta">Production Visibility · Material Flow · Inventory · Delivery</span>
        </div>

        <div className="heroBottomRow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
          <p className="heroCopy compactHeroCopy" style={{ margin: 0, fontSize: '1rem', lineHeight: 1.45, maxWidth: 760 }}>Real-time visibility and coordination for material movement, inventory, and production support across all four assembly lines.</p>
          <div className="actions homeActions" style={{ margin: 0 }}>
            <Link className="primaryButton linkButton" href="/login">Sign In</Link>
          </div>
        </div>
      </section>

      <section className="sectionBlock quickGuideBlock mobileGuideCompact" style={{ padding: '16px 20px' }}>
        <div className="guideIntro" style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <p className="eyebrow" style={{ margin: 0 }}>How LineFlow Works</p>
          <h2 style={{ fontSize: '1.35rem', margin: 0 }}>One system. Role-based access.</h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '.9rem' }}>Your position determines the tools and information you can access.</p>
        </div>
        <div className="roleMobileGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 8 }}>
          {roles.map(role => (
            <article className="roleMobileCard" key={role.title} style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--panel-2)' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '1rem' }}>{role.title}</h3>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '.82rem', lineHeight: 1.35 }}>{role.text}</p>
            </article>
          ))}
        </div>
        <div className="materialFlowCompact" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          <span className="eyebrow" style={{ margin: 0 }}>Material Flow</span>
          <strong style={{ fontSize: '.92rem' }}>Request → Accept → Deliver</strong>
        </div>
      </section>

      <TeamMessageBoard />
      <ProductionSchedule />
    </main>
  );
}

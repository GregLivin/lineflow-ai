import Link from 'next/link';
import LiveClock from '../components/LiveClock';
import ProductionSchedule from '../components/ProductionSchedule';
import TeamMessageBoard from '../components/TeamMessageBoard';

const roles = [
  { title: 'Line User', text: 'Requests material from the production line and tracks it through delivery.' },
  { title: 'Material Handler', text: 'Receives assigned requests, locates material, and completes deliveries.' },
  { title: 'Supervisor / Planner', text: 'Monitors requests, inventory, yard activity, production goals, and team updates.' },
  { title: 'Boom Material Specialist', text: 'Monitors boom material readiness, shortages, and production support.' },
];

export default function Home() {
  return (
    <main className="shell homeShell">
      <section className="hero operationsHero">
        <div className="heroTopRow">
          <div className="brandRow"><div className="logoMark">LF</div><div><p className="eyebrow">Production Operations System</p><h1>LineFlow AI</h1></div></div>
          <LiveClock />
        </div>
        <div className="operationsStatusRow"><div className="statusStrip"><span className="statusDot" /><span>Production System Online</span></div><span className="systemMeta">Live material flow · inventory · planning · delivery tracking</span></div>
        <p className="heroCopy compactHeroCopy">One live system for material requests, production planning, inventory visibility, and delivery execution across all four assembly lines.</p>
        <div className="actions homeActions"><Link className="primaryButton linkButton" href="/login">Sign In</Link><Link className="secondaryButton linkButton" href="/login?role=line">Request Material</Link></div>
      </section>

      <TeamMessageBoard />
      <ProductionSchedule />

      <section className="sectionBlock quickGuideBlock">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">How LineFlow Works</p>
            <h2>One system. Role-based access.</h2>
            <p>Every team member signs in through LineFlow. The tools, information, and controls they see are based on their assigned position.</p>
          </div>
        </div>

        <div className="quickGuideGrid roleOverviewGrid">
          {roles.map(role => (
            <article className="quickGuideCard roleOverviewCard" key={role.title}>
              <h3>{role.title}</h3>
              <p>{role.text}</p>
            </article>
          ))}
        </div>

        <div className="compactFlow">
          <span className="eyebrow">Material Flow</span>
          <strong>Request → Accept → Deliver</strong>
        </div>
      </section>
    </main>
  );
}

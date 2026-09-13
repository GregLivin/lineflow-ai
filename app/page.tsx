import Link from 'next/link';
import LiveClock from '../components/LiveClock';
import ProductionSchedule from '../components/ProductionSchedule';
import TeamMessageBoard from '../components/TeamMessageBoard';

const roles = [
  { title: 'Line User', text: 'Request material and track delivery.', href: '/login?role=line' },
  { title: 'Material Handler', text: 'Accept, pick up, and deliver assigned requests.', href: '/login?role=handler' },
  { title: 'Supervisor / Planner', text: 'Monitor requests, inventory, yard operations, and goals.', href: '/login?role=supervisor' },
  { title: 'Boom Material Specialist', text: 'Manage boom material readiness and production support.', href: '/login?role=specialist' },
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
          <div><p className="eyebrow">Quick User Guide</p><h2>Choose your role</h2><p>Use the role that matches your job to open the correct LineFlow login.</p></div>
          <Link className="secondaryButton linkButton" href="/guide">View Full User Guide →</Link>
        </div>
        <div className="quickGuideGrid">
          {roles.map(role => (
            <Link className="quickGuideCard" href={role.href} key={role.title}>
              <div><h3>{role.title}</h3><p>{role.text}</p></div>
              <span className="quickGuideAction">Sign In →</span>
            </Link>
          ))}
        </div>
        <div className="compactFlow"><span className="eyebrow">How LineFlow Works</span><strong>Request → Accept → Pick Up → Deliver → Confirm</strong></div>
      </section>
    </main>
  );
}

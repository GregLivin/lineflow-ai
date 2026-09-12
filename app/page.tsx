import Link from 'next/link';
import LiveClock from '../components/LiveClock';

const roles = [
  {
    title: "Line User",
    text: "Request material and track delivery status from the production line.",
  },
  {
    title: "Material Handler",
    text: "Receive assigned requests, accept jobs, and update delivery status.",
  },
  {
    title: "Supervisor / Planner",
    text: "Monitor production plans, priorities, handlers, inventory, goals, and material flow in real time.",
  },
  {
    title: "System Administrator",
    text: "Manage users, roles, lines, handler assignments, workflow changes, and system settings.",
  },
];

export default function Home() {
  return (
    <main className="shell homeShell">
      <section className="hero operationsHero">
        <div className="heroTopRow">
          <div className="brandRow">
            <div className="logoMark">LF</div>
            <div>
              <p className="eyebrow">Production Operations System</p>
              <h1>LineFlow AI</h1>
            </div>
          </div>

          <LiveClock />
        </div>

        <div className="operationsStatusRow">
          <div className="statusStrip">
            <span className="statusDot" />
            <span>Production System Online</span>
          </div>
          <span className="systemMeta">Live material flow · inventory · planning · delivery tracking</span>
        </div>

        <p className="heroCopy compactHeroCopy">
          One live system for material requests, production planning, inventory visibility, and delivery execution across all four assembly lines.
        </p>

        <div className="actions homeActions">
          <Link className="primaryButton linkButton" href="/login">Sign In</Link>
          <Link className="secondaryButton linkButton" href="/login">Request Material</Link>
        </div>
      </section>

      <section className="sectionBlock homeOverview">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">Live Operations</p>
            <h2>One system. Different views.</h2>
          </div>
        </div>

        <div className="roleGrid">
          {roles.map((role) => (
            <article className="roleCard" key={role.title}>
              <h3>{role.title}</h3>
              <p>{role.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sectionBlock flowBlock">
        <p className="eyebrow">Core Request Flow</p>
        <h2>Requested → Accepted → Picked Up → In Transit → Delivered → Confirmed</h2>
        <p>
          Requests route to the correct material handler while Debbie, Tammy, and Chance maintain full operational visibility and control.
        </p>
      </section>
    </main>
  );
}

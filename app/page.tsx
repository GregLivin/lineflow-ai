import Link from 'next/link';
import LiveClock from '../components/LiveClock';
import ProductionSchedule from '../components/ProductionSchedule';

const roles = [
  {
    title: "Line User",
    text: "Request material and track delivery status from the production line.",
    users: "Line 1 · Line 2 · Line 3 · Line 4",
    steps: ["Sign in with your assigned line account", "Select the model and individual material needed", "Submit the request and track it through confirmation"],
    href: "/login?role=line",
    action: "Open Line User Login",
  },
  {
    title: "Material Handler",
    text: "Receive assigned requests, accept jobs, and update delivery status.",
    users: "Greg · Tristen",
    steps: ["Sign in with your material-handler account", "Open assigned requests and accept a job", "Check each part, location, and part number as it is delivered"],
    href: "/login?role=handler",
    action: "Open Handler Login",
  },
  {
    title: "Supervisor / Planner",
    text: "Monitor production plans, priorities, handlers, inventory, goals, and material flow in real time.",
    users: "Tammy · Chance · Debbie · Jose",
    steps: ["Sign in with your supervisor or planner account", "Review live requests, priorities, handlers, and production status", "Use your authorized controls to manage operations and resolve issues"],
    href: "/login?role=supervisor",
    action: "Open Supervisor Login",
  },
  {
    title: "Boom Line Material Specialist",
    text: "Oversee boom-line material readiness, schedule status, issues, and production support.",
    users: "Greg",
    steps: ["Sign in with the Boom Line Material Specialist account", "Review boom models, required parts, locations, and readiness", "Update delivery, shortage, staging, and production-support status"],
    href: "/login?role=specialist",
    action: "Open Specialist Login",
  },
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

      <ProductionSchedule />

      <section className="sectionBlock homeOverview">
        <div className="sectionHeading"><div><p className="eyebrow">Live Operations</p><h2>One system. Different views.</h2><p>Choose a role below to see who uses it, how it works, and open the correct login.</p></div></div>
        <div className="roleGrid">
          {roles.map((role) => (
            <details className="roleCard interactiveRoleCard" key={role.title}>
              <summary>
                <div><h3>{role.title}</h3><p>{role.text}</p></div>
                <span className="roleChevron" aria-hidden="true">⌄</span>
              </summary>
              <div className="roleInstructions">
                <p className="roleUsers"><strong>Users:</strong> {role.users}</p>
                <h4>How to use this view</h4>
                <ol>{role.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                <Link className="primaryButton linkButton roleLoginButton" href={role.href}>{role.action}</Link>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="sectionBlock flowBlock"><p className="eyebrow">Core Request Flow</p><h2>Requested → Accepted → Picked Up → In Transit → Delivered → Confirmed</h2><p>Requests route to the correct material handler while Debbie, Tammy, Chance, and Jose maintain the visibility needed for production support.</p></section>
    </main>
  );
}

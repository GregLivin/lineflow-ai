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
    title: "Supervisor",
    text: "Monitor lines, priorities, handlers, and material flow in real time.",
  },
  {
    title: "System Administrator",
    text: "Manage users, roles, lines, handler assignments, and system settings.",
  },
];

export default function Home() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="brandRow">
          <div className="logoMark">LF</div>
          <div>
            <p className="eyebrow">Production Material Flow</p>
            <h1>LineFlow AI</h1>
          </div>
        </div>

        <p className="heroCopy">
          Real-time material requests, routing, delivery tracking, and supervisor visibility in one installable app.
        </p>

        <div className="statusStrip">
          <span className="statusDot" />
          <span>Designed for phone, tablet, and desktop</span>
        </div>

        <div className="actions">
          <button className="primaryButton">Request Material</button>
          <button className="secondaryButton">Open Dashboard</button>
        </div>
      </section>

      <section className="sectionBlock">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">Role-based workflow</p>
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
        <p className="eyebrow">Core request flow</p>
        <h2>Requested → Accepted → In Transit → Delivered</h2>
        <p>
          Each request will be routed to the material handler assigned to that line, while supervisors and administrators maintain visibility across the operation.
        </p>
      </section>

      <section className="installCard">
        <div>
          <p className="eyebrow">Installable PWA</p>
          <h2>Add LineFlow AI to any supported device</h2>
          <p>
            The application is structured as a Progressive Web App so it can be installed from a browser and launched from a home screen or desktop like an app.
          </p>
        </div>
      </section>
    </main>
  );
}

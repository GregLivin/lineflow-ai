import Link from 'next/link';

const guides = [
  { role:'Line User', purpose:'Request material from the production line and follow it through delivery.', steps:['Sign in with your assigned line account.','Select the model and material or individual part needed.','Submit the request with the correct priority.','Track the request as it is accepted and delivered.','Confirm the material was received.'], href:'/login?role=line' },
  { role:'Material Handler', purpose:'Work assigned material requests and keep delivery status accurate.', steps:['Sign in with your material-handler account.','Open your assigned request queue.','Accept the request you are working.','Review the part, part number, quantity, and location.','Pick up and deliver the material.','Update the request when delivery is complete.'], href:'/login?role=handler' },
  { role:'Supervisor / Planner', purpose:'Monitor production and keep the team aligned with material and production goals.', steps:['Sign in with your supervisor account.','Post or edit the Daily Team Message when needed.','Monitor material requests across Lines 1–4.','Review inventory, shortages, and material readiness.','Track boom lifts in Yard & Reconditioning.','Review daily Green Tag goals and production progress.'], href:'/login?role=supervisor' },
  { role:'Boom Material Specialist', purpose:'Support boom-line material readiness and reconditioning operations.', steps:['Sign in with the Boom Material Specialist account.','Review boom material requirements and current requests.','Check models, part numbers, and material locations.','Monitor shortages and units waiting on material.','Review yard reconditioning and Green Tag progress.'], href:'/login?role=specialist' },
];

export default function GuidePage(){
 return <main className="shell">
  <section className="hero"><p className="eyebrow">LineFlow AI</p><h1>User Guide</h1><p className="heroCopy">Quick instructions for each LineFlow role. Choose your role, follow the workflow, and use the correct login.</p><div className="actions"><Link className="secondaryButton linkButton" href="/">← Back to Home</Link></div></section>
  <section className="sectionBlock"><p className="eyebrow">Standard Material Flow</p><h2>Request → Accept → Pick Up → Deliver → Confirm</h2></section>
  <section className="guideRoleGrid">
   {guides.map(guide=><article className="sectionBlock guideRoleCard" key={guide.role}><p className="eyebrow">Role Guide</p><h2>{guide.role}</h2><p>{guide.purpose}</p><ol>{guide.steps.map(step=><li key={step}>{step}</li>)}</ol><Link className="primaryButton linkButton" href={guide.href}>Go to {guide.role} Login →</Link></article>)}
  </section>
 </main>;
}

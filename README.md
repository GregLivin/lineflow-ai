# LineFlow AI

LineFlow AI is a live material ordering, delivery, inventory, production-planning, and production-flow system for four assembly lines.

## Live Demo

**https://lineflow-ai.vercel.app**

The application is deployed through Vercel and connected to a dedicated Supabase backend for shared operational data and realtime updates.

## Current Development Status

LineFlow AI now includes:

- Role-based demo login and dashboards
- Live production schedule
- Shared Supabase PostgreSQL database
- Realtime production-schedule updates across devices
- Production schedule editing for authorized operations roles
- Database foundation for material requests, inventory, movements, alerts, and audit history
- Remote leadership dashboard for Tammy
- Houston operations dashboards for production personnel

The next major phase is secure Supabase authentication and the live material-request/delivery workflow.

## How It Works

1. Assembly-line users log in and request material.
2. Requests automatically route to the responsible material handler based on material type.
3. Handlers accept, pick up, transport, and deliver material.
4. LineFlow tracks request and delivery timestamps, inventory quantity, and material location.
5. Planners and Houston operations personnel manage the production schedule and material readiness.
6. Leadership can monitor Houston operations remotely, including production plans, inventory, alerts, requests, goals, and performance.

## Delivery Workflows

- **Hoods → Tristen → Forklift**
- **Booms → Greg → Combi Lift**
- Additional materials, handlers, and backup assignments can be configured as operations expand.

## Users & Roles

- **Tammy** — Operations Leadership / System Administrator; top-level remote operations visibility and control from Pennsylvania
- **Chance** — Houston Supervisor / System Administrator
- **Debbie** — Planner / System Administrator
- **Jose** — Boom Line Material Specialist; oversees boom-line material readiness and can update the production schedule
- **Greg** — Boom Material Handler / Combi Lift
- **Tristen** — Hood Material Handler / Forklift
- **Lines 1–4** — Assembly Line Users who place material requests and track delivery status

Tammy has a dedicated **Houston Operations Overview** designed for remote leadership. Debbie, Tammy, Chance, and Jose can currently modify the shared production schedule.

## Live Production Schedule

The home screen includes a shared production schedule backed by Supabase rather than browser-only storage. Authorized users can add, modify, and remove schedule rows.

Current schedule fields include:

- Priority
- Job
- Model
- Serial
- Status
- Boom
- Completion target
- Comments

Production statuses can include **Planned, Start Today, Continue, In Progress, Complete Today, Hold,** and **Waiting on Material**.

Changes are stored centrally so the same schedule can be viewed across devices. Realtime database subscriptions allow connected users to receive schedule updates without relying on the same computer or browser.

## Remote Leadership — Tammy

Tammy's dashboard provides a high-level view of Houston operations from Pennsylvania, including:

- Production schedule control
- Assembly Lines 1–4
- Material operations
- Boom and hood workflows
- Inventory visibility
- Leadership alerts
- Goals and performance
- Workflow control
- Audit history

The goal is to provide enough live operational visibility that leadership can understand plant status remotely without depending on manual status calls.

## Supabase Backend

LineFlow AI has a dedicated **`lineflow-ai`** Supabase project with PostgreSQL and realtime capabilities.

Current database tables:

- `users`
- `production_schedule`
- `material_requests`
- `inventory`
- `inventory_movements`
- `alerts`
- `activity_logs`

Row Level Security (RLS) is enabled. Production-grade role policies and Supabase authentication are part of the security phase of development.

## Material Request Lifecycle

The planned request workflow is:

**Requested → Accepted → Picked Up → In Transit → Delivered → Confirmed**

Each stage will store timestamps so LineFlow can calculate response time, pickup time, travel/delivery time, and total request-to-delivery time.

## Inventory & Alerts

The inventory system is being designed to track:

- Quantity on hand
- Reserved quantity
- Available quantity
- Material in transit
- Storage/staging location
- Low-stock and out-of-stock conditions
- Shortages and overages
- Damaged or incorrect material
- Inventory discrepancies
- Material readiness against the production plan
- Reorder/safety-stock levels
- Complete inventory movement history

## Hood Storage

Hood storage contains **31 hood rows plus 1 miscellaneous row**, for 32 logical rows. Hood styles that are alike may occupy one or multiple rows/sections with different quantities.

The hood inventory module will map hood style, row/section, quantity, availability, and delivery activity to Tristen's forklift workflow.

## Boom Material

Known boom material examples include:

- Base Boom — `0801316`
- Inner Mid — `0801317`
- Outer Mid — `0801318`
- Fly Boom — `0801319`

Additional boom material includes telescope cylinders, push tubes, power tracks, and other production components. Boom inventory will connect locations and quantities to Greg's Combi Lift workflow and Jose's boom-line oversight.

## Goals & Performance

Leadership will be able to create and track weekly and monthly goals such as:

- Delivery response time
- On-time delivery rate
- Inventory accuracy
- Shortages and stockouts
- Damaged material
- Production targets
- Open material issues

Greg and Tristen will receive end-of-shift summaries covering deliveries completed, response/delivery time, on-time performance, trips, issues, and other relevant shift metrics.

Performance reporting should distinguish material-handler delays from production delays, shortages, equipment delays, and supervisor/production-plan changes.

## Planned Audit & Change Tracking

Important operational changes will ultimately record:

- Who made the change
- What changed
- Date and time
- Reason for the change
- Affected line/material/workflow

This includes schedule changes, inventory adjustments, routing changes, priorities, and other production-impacting actions.

## Technology

- **Frontend:** Next.js 15, React 19, TypeScript
- **Database:** Supabase PostgreSQL
- **Realtime:** Supabase Realtime
- **Hosting / Deployment:** Vercel
- **Source Control:** GitHub
- **Target:** Responsive web application usable on desktop, tablet, and mobile devices

## Next Development Phase

1. Replace demo-only authentication with secure Supabase Auth.
2. Create role-based database permissions for leadership, supervisors, planners, specialists, handlers, and assembly lines.
3. Build the live material-request form for Lines 1–4.
4. Automatically route hood requests to Tristen and boom requests to Greg.
5. Build Greg and Tristen's live delivery queues.
6. Add delivery-status timestamps and confirmation.
7. Connect inventory movements to deliveries.
8. Add realtime alerts and leadership reporting.
9. Add schedule/activity audit history.
10. Continue improving the system using real production feedback.

## Operations Questions Still To Confirm

1. Official names of Lines 1–4
2. Shared line logins vs individual worker accounts
3. Additional materials and responsible handlers
4. Backup handlers for Greg and Tristen
5. Approved priority levels and delivery-time targets
6. Complete official storage/staging locations
7. Hood styles, quantities, and sections for all 32 rows
8. Low-stock/reorder thresholds
9. Definitions for shortage, overage, damage, and other exceptions
10. Weekly/monthly leadership goals
11. Required daily and end-of-shift report information
12. Production-floor devices that will run LineFlow AI

## Project Goal

Build LineFlow AI around the real production process, create one shared source of operational information, reduce material delays and shortages, improve communication between the assembly lines and material handlers, provide leadership with live visibility, and continuously improve the system using real operational feedback.

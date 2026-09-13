# LineFlow AI

LineFlow AI is a realtime production and material-flow platform for assembly-line support, inventory visibility, material delivery, production planning, and reconditioning recovery.

## Live Demo

**https://lineflow-ai.vercel.app**

## Core Features

- Live production schedule
- Material requests by model, machine, and part
- Request workflow: **Requested → Accepted → Picked Up → In Transit → Delivered → Confirmed**
- Machine/serial-linked production history
- Live inventory, locations, reservations, and movements
- Automatic inventory reservation for open requests
- Realtime Supabase updates across devices
- Role-based operational dashboards
- LineFlow Recovery AI

## LineFlow Recovery AI

**Reconditioning Production Intelligence** helps leadership understand and reduce the reconditioning backlog using actual production, material, and inventory data.

It tracks backlog, completed machines, completion time, material wait, delayed machines, inventory readiness, and stock shortages.

For backlog recovery, LineFlow can use:

**Required weekly completions = incoming machines per week + (backlog ÷ recovery weeks)**

Machines can then be prioritized as **Quick Win, Material Ready, Partially Ready, Blocked by Stock,** or **Inventory Match Needed**.

## Live Inventory

LineFlow tracks on-hand, reserved, available, in-transit, low-stock levels, part numbers, locations, and inventory movements. Open material requests can reserve matching stock so the same inventory is not assigned to multiple machines.

For production use, the preferred approach is to connect LineFlow to the company's existing inventory/ERP/WMS system as a **read-only source of truth** through an approved API, reporting feed, database view, or scheduled export.

**Company Inventory / ERP → LineFlow Live Inventory → Recovery AI**

## Roles

- **Tammy** — Operations Leadership / System Administrator
- **Chance** — Houston Supervisor / System Administrator
- **Debbie** — Planner / System Administrator
- **Jose** — Boom Line Material Specialist
- **Greg** — Boom Material Handler / Combi Lift
- **Tristen** — Hood Material Handler / Forklift
- **Lines 1–4** — Assembly Line Users

Material routing currently follows **Booms → Greg** and **Hoods → Tristen**.

## Technology

- Next.js / React / TypeScript
- Supabase PostgreSQL + Realtime
- Vercel
- GitHub
- Responsive desktop, tablet, and mobile interface

## Next Phase

1. Identify and connect the company's existing inventory/WMS/ERP system.
2. Build the Recovery Priority Queue and Backlog Recovery Planner.
3. Expand daily production and material reporting.
4. Collect verified production history for predictive modeling.
5. Replace demo authentication/policies with production-grade role-based security.

## Project Goal

Connect production schedules, machine history, material requests, inventory, and completion performance in one operational system that reduces material delays, helps recover the reconditioning backlog, improves material-flow communication, and gives leadership live production visibility.

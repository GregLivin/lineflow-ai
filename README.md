# LineFlow AI

LineFlow AI is a production operations and material-flow platform for assembly-line support, inventory visibility, material delivery, production planning, and reconditioning recovery.

## Live Demo

**https://lineflow-ai.vercel.app**

The application is deployed through Vercel and connected to a dedicated Supabase PostgreSQL backend for shared operational data and realtime updates.

## Current Development Status

LineFlow AI currently includes:

- Role-based demo login and dashboards
- Live production schedule
- Live material request and delivery workflow
- Machine/serial-linked production history
- Live inventory and inventory movement tracking
- Automatic inventory reservation for open material requests
- Material delivery timestamps and per-part delivery confirmation
- LineFlow Recovery AI / Reconditioning Production Intelligence
- Reconditioning backlog, completion-time, and material-wait metrics
- Shared Supabase PostgreSQL database and realtime updates
- Remote leadership dashboard for Tammy
- Houston operations dashboards for production personnel

The current system is a working development/pilot platform. Secure Supabase authentication and production-grade database authorization remain part of the security phase.

## How It Works

1. Assembly-line users select a model/machine and request required material.
2. Boom requests route to Greg and hood requests route to Tristen.
3. LineFlow checks live inventory and reserves matching material for open requests.
4. Material handlers accept, pick up, transport, and deliver material.
5. Individual parts are checked off as delivered and inventory is updated.
6. Production schedules, machine serials, material history, and completion timestamps build production history.
7. Supervisors and leadership use LineFlow Recovery AI to identify backlog, material constraints, completion performance, and recovery opportunities.

## Delivery Workflows

- **Hoods → Tristen → Forklift**
- **Booms → Greg → Combi Lift**
- Additional materials, handlers, and backup assignments can be configured as operations expand.

## Users & Roles

- **Tammy** — Operations Leadership / System Administrator; remote operations visibility and production recovery oversight
- **Chance** — Houston Supervisor / System Administrator
- **Debbie** — Planner / System Administrator
- **Jose** — Boom Line Material Specialist; boom-line material readiness and schedule support
- **Greg** — Boom Material Handler / Combi Lift
- **Tristen** — Hood Material Handler / Forklift
- **Lines 1–4** — Assembly Line Users who place material requests and track delivery status

Tristen's operational view is restricted to hood material. Tammy has a focused leadership view containing the Daily Team Message, Production Schedule, LineFlow Recovery AI, and live inventory information.

## Live Production Schedule

The production schedule is backed by Supabase rather than browser-only storage. Authorized operations users can add and modify production information including:

- Priority
- Job
- Model
- Serial
- Status
- Boom
- Completion target
- Comments

Schedule rows with serial numbers can be linked to machine production records. Machine status changes can capture production start, completion, and Green Tag timestamps for later analysis.

## LineFlow Recovery AI

**LineFlow Recovery AI — Reconditioning Production Intelligence** is designed to help operations reduce a large reconditioning backlog using actual production and material data.

Current Recovery AI metrics include:

- Reconditioning backlog
- Machines completed today
- Average completion time
- Average material wait
- Machines at risk, delayed, or waiting on material
- Live inventory readiness
- Inventory-ready machines
- Machines blocked by stock
- Low-stock material

The system does not fabricate predictions. Predictive and machine-learning recommendations are intended to activate only after enough reliable production history has been collected.

### Backlog Recovery Strategy

If operations are 40 or more machines behind, the system should do more than display the backlog. The recovery planner is intended to calculate the completion pace required to catch up while accounting for new incoming reconditioning work.

A core planning formula is:

**Required weekly completions = normal incoming machines per week + (current backlog ÷ desired recovery weeks)**

Recovery AI can ultimately classify machines into operational groups such as:

- **Quick Win** — close to completion with required material available
- **Material Ready** — required inventory is available/reserved
- **Partially Ready** — some required material is available
- **Blocked by Stock** — required material is unavailable
- **Inventory Match Needed** — required part is not yet mapped to live inventory
- **Long Cycle** — production history indicates a longer completion cycle

The goal is to create a pipeline where production finishes inventory-ready machines while material handlers stage the next machines and identify shortages before they stop production.

## Machine Production Intelligence

LineFlow connects production schedule records, machine serials, material requests, individual delivered parts, and machine completion timestamps.

For each machine, the data foundation can track:

- Job
- Model
- Serial number
- Production/reconditioning status
- Start time
- Completion time
- Green Tag time
- Materials requested
- Materials delivered
- Material request-to-delivery time
- Total completion time

This foundation supports daily production reporting and future analysis of which machines take longest to complete and which material delays contribute most to lost production time.

## Live Inventory

LineFlow currently has its own live inventory layer capable of tracking:

- Material type
- Material name
- Part number
- Storage/staging location
- Quantity on hand
- Reserved quantity
- Available quantity
- Material in transit
- Low-stock threshold
- Incoming inventory movements
- Outgoing inventory movements
- Inventory movement history

Available inventory is calculated from on-hand stock after reservations. Open material requests can reserve matching inventory so the same stock is not treated as available for multiple machines.

When reserved material is delivered, LineFlow can consume the appropriate inventory quantity, release its reservation, and record the outgoing movement.

## Existing Company Inventory / ERP Integration

For a production deployment, LineFlow does **not** need to replace an existing company inventory, ERP, or warehouse-management system. The preferred architecture is to integrate with the company's approved system and use it as the inventory **source of truth**.

Potential approved integration methods include:

- REST/API integration
- Read-only database or reporting connection
- Scheduled CSV/Excel export/import
- ERP/WMS reporting feed
- Approved middleware or integration service

The preferred first production integration is **read-only**: LineFlow reads approved inventory data without changing the company's official inventory records.

An integration could map fields such as:

- Part number
- Material description
- Quantity on hand
- Allocated/reserved quantity
- Available quantity
- Storage location
- Incoming material
- Inventory transactions

The flow would be:

**Company Inventory / ERP → Approved Integration → LineFlow Live Inventory → Recovery AI**

This prevents unnecessary duplicate data entry while allowing LineFlow to focus on production readiness, material flow, reconditioning recovery, and operational intelligence.

The exact integration method must be determined after identifying the company's existing inventory/WMS/ERP platform and receiving appropriate technical access/approval.

## Material Request Lifecycle

The live request workflow is:

**Requested → Accepted → Picked Up → In Transit → Delivered → Confirmed**

Each stage stores timestamps so LineFlow can measure response time, pickup time, delivery time, and total request-to-delivery time.

Required parts can also be tracked individually with quantity, part number, location, reservation status, and delivery status.

## Hood Storage

Hood storage contains **31 hood rows plus 1 miscellaneous row**, for 32 logical rows. Hood styles that are alike may occupy one or multiple rows/sections with different quantities.

The hood inventory module is intended to map hood style, row/section, quantity, availability, and delivery activity to Tristen's forklift workflow.

## Boom Material

Known boom material examples include:

- Base Boom — `0801316`
- Inner Mid / Big Mid — `0801317`
- Outer Mid / Small Mid — `0801318`
- Fly Boom — `0801319`
- Telescope Cylinder — `1684178`
- Lower Push Tube — `1180369`
- Upper Push Tube — `1180370`
- Power Track T/T — `1001131620`
- Power Track Upper — `1001131720`

Boom material can be connected to model requirements, inventory quantities, locations, machine serials, material requests, Greg's Combi Lift workflow, and Jose's boom-line oversight.

## Daily Reporting & Performance

The production data foundation is intended to generate daily reports showing:

- Machines completed
- Materials delivered for each machine
- Completion time by machine
- Longest machine completion
- Material request and delivery times
- Machines waiting on material
- Inventory shortages
- Daily Green Tag performance
- Backlog movement

Performance reporting should distinguish material-handler delays from production delays, shortages, equipment delays, and production-plan changes.

## Supabase Backend

LineFlow AI uses a dedicated Supabase PostgreSQL backend with realtime capabilities.

Core operational data includes:

- `production_schedule`
- `machine_runs`
- `material_requests`
- `request_parts`
- `model_parts`
- `inventory`
- `inventory_movements`
- production intelligence views and supporting operational tables

Row Level Security is enabled on relevant tables, but the current development/demo policies are intentionally permissive. Production deployment requires proper authenticated role-based database policies.

## Technology

- **Frontend:** Next.js, React, TypeScript
- **Database:** Supabase PostgreSQL
- **Realtime:** Supabase Realtime
- **Hosting / Deployment:** Vercel
- **Source Control:** GitHub
- **Target:** Responsive web application usable on desktop, tablet, and mobile devices

## Next Development Phase

1. Identify the company's current inventory/WMS/ERP system and available approved integration method.
2. Build a read-only company-inventory connector and field mapping.
3. Build the Recovery Priority Queue for backlogged reconditioning machines.
4. Add a Backlog Recovery Planner with target completion-rate scenarios.
5. Standardize production statuses and completion events.
6. Expand daily production and material reports.
7. Collect enough verified production history for meaningful predictive modeling.
8. Replace demo authentication with secure Supabase Auth.
9. Implement production-grade role-based database authorization.
10. Add stronger audit/change history and operational exception tracking.

## Operations Questions Still To Confirm

1. Name and version of the company's existing inventory/WMS/ERP system
2. Whether an API, reporting feed, database view, or scheduled export is available
3. Who can authorize read-only integration access
4. Official names of Lines 1–4
5. Shared line logins vs individual worker accounts
6. Additional materials and responsible handlers
7. Backup handlers for Greg and Tristen
8. Complete official storage/staging locations
9. Hood styles, quantities, and sections for all 32 rows
10. Official low-stock/reorder thresholds
11. Weekly incoming reconditioning volume
12. Desired backlog recovery period and sustainable weekly completion target

## Project Goal

Build LineFlow AI around the real production process without unnecessarily replacing systems the company already relies on. LineFlow should connect production schedules, machine history, material requests, approved inventory data, and completion performance into one operational intelligence layer that reduces material delays, helps recover reconditioning backlog, improves communication between assembly lines and material handlers, and gives leadership live visibility into what is preventing production from completing machines.
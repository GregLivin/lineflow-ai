# LineFlow AI

Real-time material request and delivery system connecting assembly lines with dedicated material handlers for faster, more efficient production flow.

## Project Goal

LineFlow AI is designed to improve communication between assembly-line personnel and material handlers. A worker can submit a material request from their line, and the system routes the request to the material handler assigned to that line while giving supervisors visibility into the overall material flow.

## Core Workflow

1. Assembly-line user submits a material request.
2. The request is automatically routed to the dedicated material handler for that line.
3. The material handler receives the request and accepts it.
4. Request status progresses through **Requested → Accepted → In Transit → Delivered**.
5. Supervisors can monitor requests, delivery status, lines, and material-handler activity.

## Planned Features

- Line-specific material requests
- Dedicated material-handler assignments
- Real-time request notifications
- Priority levels for urgent material needs
- Request status tracking
- Supervisor dashboard
- Delivery history and timestamps
- Daily material-flow reports
- Inventory integration
- Mobile-friendly interface for use on the production floor
- Role-based access for supervisors, material handlers, and line users

## Initial Team

| Contributor | Operational Role | Project Role |
| --- | --- | --- |
| Tammy | Supervisor | Workflow contributor / supervisor feedback |
| Chance | Supervisor | Workflow contributor / supervisor feedback |
| Greg | Material Handler | Developer / system administrator / workflow contributor |

## Access Model

Operational job roles and application permissions are kept separate. Supervisors can receive supervisor-level visibility, while Greg can use the Material Handler workflow and retain administrator/developer permissions for building and maintaining the system.

## Status

Early development / prototype planning.

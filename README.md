# LineFlow AI

LineFlow AI is a material ordering, delivery, and inventory tracking system for four assembly lines.

## How It Works

1. An assembly-line user logs in and places a material order.
2. LineFlow AI routes the order to the correct material handler.
3. The handler accepts, picks up, transports, and delivers the material.
4. Delivery times, inventory quantity, and material location are updated automatically.
5. Supervisors can monitor all four lines, open requests, inventory, and delivery performance.

## Current Delivery Workflows

- **Hoods → Tristen → Forklift**
- **Booms → Greg → Combi Lift**
- Other materials can be assigned to the correct handler as the system expands.

## Users

- **Assembly Line 1** — place and track orders
- **Assembly Line 2** — place and track orders
- **Assembly Line 3** — place and track orders
- **Assembly Line 4** — place and track orders
- **Greg** — Boom Material Handler / Combi Lift workflow
- **Tristen** — Hood Material Handler / Forklift workflow
- **Tammy** — Supervisor / System Administrator
- **Chance** — Supervisor / System Administrator

## Core Features

- Separate logins and role-based dashboards
- Automatic request routing
- Material pickup and delivery status
- Request, acceptance, pickup, transit, and delivery timestamps
- Live inventory quantities
- Material location tracking
- 31 hood rows + 1 miscellaneous row
- Boom material locations and part numbers
- Low-stock alerts
- Delivery history
- Daily material-flow reports
- Supervisor dashboard
- Mobile-friendly / installable app

## Questions for Tammy & Chance

1. What are the official names of the four assembly lines?
2. Should each line share one login or should each worker have an individual account?
3. What materials besides hoods and booms should be added?
4. Who handles those additional material types?
5. Who covers hood or boom deliveries when Tristen or Greg is absent?
6. What request priorities should we use (Normal, Urgent, Line Stopped)?
7. How long can a request wait before it is considered late?
8. What are all official material storage and staging locations?
9. What hood styles, quantities, and sections belong in each hood row?
10. When material reaches an assembly line, should it remain in inventory or be marked as consumed?
11. Who can manually change inventory counts or material locations?
12. Can assembly-line users edit or cancel an order after submitting it?
13. What type of alert should material handlers receive for a new order?
14. What information should appear first on the supervisor dashboard?
15. What information should be included in the daily report?
16. Should materials include reference photos for identification/loading position?
17. Should the system track damaged, missing, returned, or incorrect material?
18. At what quantity should a low-stock alert be triggered?
19. Does the system need separate day-shift and night-shift tracking?
20. What devices will be used on the floor: phones, tablets, computers, or all three?

## Project Goal

Build a working system from the current production workflow, use it on the floor, and continue improving it based on real operational feedback.

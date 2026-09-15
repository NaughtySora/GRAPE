## GRAPE concent

I want to write small conception use almost no external tools, and
technologies to demonstrate general ideas.

To make example super simple i will omit any 
business logic, security, browser related things, no private networks, and so on.

Also url will be hardcoded to localhost, only 1 balancer | gateway.

I will include both client and application to demonstrate the core logic.

#### File topology, from up to bottom:
- Application
1. main.js - starting point of entire application, 
starts services for particular client.
2. application.js - starts the api balancer, and and all apis.
3. api.js - starts the api gateway(s) and all clusters.
4. cluster.js - starts particular cluster of services and its dedicated balancer

- Client
1. client.js - client that will call application for demonstration.

#### Participants
Balancer for each api endpoint:
1. Public
2. Admin
3. Integration

Gateway:
1. Public
2. Admin
3. Integration

Balancer for each service:
1. Public
2. Admin
3. Integration

Services:
1. Order
1.1 Public
1.2 Integration
1.3 Admin
2. User
2.1 Public
2.2 Integration
2.3 Admin
2.4 Mobile
3. Notification
2.2 Integration

Each service has own resources, located in respective folders.\

Each service has subservices for each client:
- public - for web clients
- admin - for web clients, admin access.
- integration - suppose to be internal network, service to service communication, usually
has different transport like gRPC or so.
- mobile - phone clients, reason is: no cookies, maybe different logic.

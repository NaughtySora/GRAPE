#### GRAPE
Granular Responsibility Application Platform Engineering

#### idea of GRAPE
Think of an abstraction as one, but design it so each client
is isolated and all the clients form the abstraction.

#### Picture in my head
Inspired by grape, small abstractions as grape berries form whole grape.
You can pick one grape berry or a couple or whole thing.

#### Description
A lot of papers, thoughts, conversations formal and informal about 
Single Responsibility and Separation of Concerns, Layers, Clients, etc.

I was reading and trying a lot of different formats and approaches for
modern distributed architecture and got here after a lot of real implementations.

Single Responsibility (SRP) is part of SOLID pattern, which says that
each programming abstraction has to have one and only one reason to change.

SoC or Separation of Concerns (Soc) tells us to
break complexity into distinct, independent abstractions
so each abstraction addresses own functionality, vary independently.

SRP and SoC also connected to GRASP low-couple and high-cohesion principals.

Robert Martin tells about abstraction should have only one client which demands changes.

You need to understand what client is, and how to properly separate them.
There are many different things that can separate clients.
For example:
- physical clients - person a, person b.
- privileges in the system - user, admin, owner.
- devices and transport - web, mobile, cli.
- internal communication - services need to communicate with independent of api.
- third-party providers - kyc, payments, documents.
- teams

Modern micro-services define responsibility for domains like user, order, notification.
But I decided to expend this approach and not only separate domains but also
users who use it.

It leads me to create new entity a "subservice".
So application can be arranged into services composed of subservices.
Subservices share everything inside a service.

But each subservice can be developed, deployed, maintained and scaled
separately. 

#### Schema
Horizontal layers, services are "shared-nothing"
```
[----------User service----------]
[----------Order service---------]
[------Notification service------]
```
Vertical layers, "subservices"
New subservice can be added if new client arises.
```
     ┌── user.public
     ├── user.admin
     ├── user.integration
     │
┌────┴────────────┐
│  User Service   │
└─────────────────┘
```
#### Example
Here we can easily add "mobile" client/subservice. 
If our public api uses http + cookie for session, 
you can easily make some adapters and expose mobile api
that uses wrapper around public internals or define completely new rules.

Making separated mobile entry into application allow you to vary mobile api
and satisfy mobile users independently. You can even use different transport,
it does matter cause mobile users can have own config, transport, auth flow etc.

It doesn't mean that each service has to have public api, or admin api.
They are independent and can be merged | deleted when application grows and
changes.

You still would have separated things like:
config:
public.secret\
admin.secret

http api:
/public/auth\
/admin/auth

But instead making it one big service, you run them independently.
If you designing it separately, you can run them separately even if
initial development starts as one big service, in the future you can easily run
them independently, or if compatible you can run them as one in the development
and separately at production.

#### Overall schema 
```
+=================================================+
| user:          | public | integrations | admin  |
| order:         | public | integrations | admin  |
| notifications: | integrations                   |
+=================================================+
```
#### Benefits
It will allow to scale each subservice independently.

You can have user service to be:
10 public service users using, 
1 admin 
20 integrations.

You can add resources, add pods, to each subservice.
If you have problems with public api, admin still can use admin api.

You can assign each team to work on user service and each dev on subservice.

#### Architecture pattern need to be achieved with this approach
1. Maintenance (low complexity)
2. Testing
3. Scaling
4. Deployment
5. Observability

#### Downsides
- Need solid understanding of what you are doing.
- Setup complexity.


#### third-party
I was also thinking how to arrange third-party interaction.
My though is to make integration service.

Need to clarify here.
There 2 integrations types. 
- subservice integration is api for application service to service communication.
- third-party integration is api for integration with outside of your application providers.

##### service to service integration
We have our 2 services:
1. user service.
2. notification service.

User asks public api to do something.\
Call "user.public" via user/public/dosomething.\
Inside it may call internal services, like notification.\
We don't want to interact with notification.public, instead we
provide integration api for our services to call
notification/integration/dosomething

##### third-party integration
First, the solution.\
I would create separated service "third-party service".\
Inside it, i would make many small subservices for each client.
- Kyc subservice
- Payment subservice
and so on.

What could be different?
I was thinking to either expose integration services.
It would introduce many clients for 1 subservice,
which makes service have unpredictable or many source load,
many configs and complexity.
Also integration service suppose to be internal and use private network.
Also we can't attach third-party strictly to some our service.
For example KYC usually means user, but payments can be for order,
subscriptions, etc.

Its better to make separated place for third-party and give each one own
deployment, scaling, configs, transport and business rules.

##### schemas of services and subservices
```
USER
├── user.public
├── user.admin
└── user.integration

ORDER
├── order.public
├── order.admin
└── order.integration


THIRD-PARTY INTEGRATIONS
├── i.kyc
├── i.payments
├── i.documents
└── ...
```

#### third-party interaction
```
third-party KYC
       │
       │ webhook
       ▼
┌───────────────┐
│    i.kyc      │
│               │
│ webhook       │
│ validation    │
│ business rule │
└───────┬───────┘
        │
        │ message
        ▼
     RabbitMQ
        │
        ▼
 user.integration consumer
        │
        ▼
     User DB
```

#### schema of public api
```
                                   Client
                                      │
                                      ▼
                              ┌───────────────┐
                              │      CDN      │
                              │ DDoS / WAF /  │
                              │     Edge      │
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │ Load Balancer |
                              └───────┬───────┘
                                      │
                                      ▼
                         ┌────────────────────────┐
                         │     Public gateway     │
                         └───────────┬────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
             ┌────────────┐   ┌────────────┐   ┌────────────┐
             │ user.public│   │order.public│   │    ...     │
             └────────────┘   └────────────┘   └────────────┘
                   │
                   ▼ 
        ┌───────────────────────┐
        | pod#1 pod#2 pod#3 ... |
        └───────────────────────┘
```

The way can be arranged admin api.
Internal api should not be public, but service also better to use
api for all integration subservices.
- refactor package.json commands
- gateways for subservices
- expose proper integration api for other services.
It should be something like /public.ts with 
export class UserIntegrations {}, uses gateway URL 
to interact with user.integration service so other future services
can use this facade.
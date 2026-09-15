## User service

### install
npm i --allow-git=all

### commands
All commands runs in root folder of the service "/user".\
'subservice' represents desired subservice like public, admin, integration.

##### nest commands
- 'subservice':start - build and run subservice
- 'subservice':build - build subservice
- 'subservice':dev - run subservice dev mode
- 'subservice':run - run builded version of subservice
- 'subservice':test - run tests in src/services/subservice
##### image commands
- 'subservice':image:build - build an image
- 'subservice':image:run - run image
- 'subservice':image:stop - stop image
##### compose commands
- 'subservice':compose:up - run compose
- 'subservice':compose:down - stop compose
- 'subservice':dev:compose:up - run everything but server, can be used to run
all related images like postgres, redis etc for locally running subservice
##### migrations commands
- migrations:run - run migrations
- migrations:generate - generate migrations
- migrations:apply - used by image to run migrations on built service.
##### misc commands
- crypto:key - generates base64 crypto key

#### booting docker compose
- check shared networks
- check envs
- try first build image if something is wrong
- make sure global_user_public_net docker network exists.
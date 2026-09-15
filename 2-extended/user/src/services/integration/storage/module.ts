
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { IntegrationUserRepository } from './repositories/IntegrationUserRepository';
import { UserAddressSchema, UserSchema } from '@/storage/schemas/UserSchema';
import config from '../config';

const { orm, pg } = config.integration.storage;

const schemas = [
  UserSchema,
  UserAddressSchema,
];

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      host: pg.host,
      port: pg.port,
      username: pg.username,
      password: pg.password,
      database: pg.database,
      type: orm.type,
      entities: schemas,
      migrations: [orm.migration],
      synchronize: orm.synchronize,
      dropSchema: orm.dropSchema,
      extra: {
        max: 50,
        min: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        allowExitOnIdle: false,
      }
    }),
    TypeOrmModule.forFeature(schemas),
  ],
  providers: [
    IntegrationUserRepository,
  ],
  exports: [
    TypeOrmModule,
    IntegrationUserRepository,
  ],
})
export class StorageModule { }

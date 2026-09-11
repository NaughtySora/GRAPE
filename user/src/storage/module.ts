
import { Global, Module } from '@nestjs/common';
import { UserSchema } from './schemas/UserSchema';
import { TypeOrmModule } from "@nestjs/typeorm";
import config from '@/config';

const { orm, pg } = config.service.storage;

const schemas = [
  UserSchema,
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

  ],
  exports: [
    TypeOrmModule,
  ],
})
export class StorageModule { }

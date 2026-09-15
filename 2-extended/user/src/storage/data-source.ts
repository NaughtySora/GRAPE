process.loadEnvFile();
import config from '@/config';
import { DataSource } from 'typeorm';

const { orm, pg } = config.service.storage;

export default new DataSource({
  host: pg.host,
  port: pg.port,
  username: pg.username,
  password: pg.password,
  database: pg.database,
  schema: pg.database,
  type: orm.type,
  entities: [orm.schemas],
  migrations: [orm.migration],
  synchronize: orm.synchronize,
  dropSchema: orm.dropSchema,
});

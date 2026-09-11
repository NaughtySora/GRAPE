import { resolve } from "node:path";

const env = process.env;

const config = {
  prefix: 'user',
  integration: {
    http: {
      port: parseInt(env.INTEGRATION_HTTP_PORT as string, 10),
    },
    security: {
      signature: {
        algo: 'sha256',
        secret: Buffer.from(env.INTEGRATION_API_SECRET as string, 'base64'),
        skew: 60,
      }
    },
    storage: {
      orm: {
        type: 'postgres',
        synchronize: false,
        dropSchema: false,
        schemas: resolve(__dirname, '../storage/schemas/*.{js,ts}'),
        migration: resolve(__dirname, '../storage/migrations/**/*.{js,ts}'),
      },
      pg: {
        host: env.INTEGRATION_DB_HOST,
        port: parseInt(env.INTEGRATION_DB_PORT as string, 10),
        username: env.INTEGRATION_DB_USER,
        password: env.INTEGRATION_DB_PASSWORD,
        database: env.INTEGRATION_DB_NAME,
        pool: {
          max: 50,
          min: 5,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
          allowExitOnIdle: false,
        }
      },
    }
  },
} as const;

export type IntegrationConfig = typeof config;
export default config;

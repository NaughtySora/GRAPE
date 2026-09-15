import { resolve } from "node:path";
import { IntegrationConfig } from "../../config";

export default {
  integration: {
    http: {
      port: 3000,
    },
    security: {
      signature: {
        algo: 'sha256',
        secret: Buffer.from('abc'),
        skew: 60,
      }
    },
    storage: {
      orm: {
        type: 'postgres' as any,
        synchronize: false,
        dropSchema: false,
        schemas: resolve(__dirname, '../../../../storage/schemas/*.{js,ts}'),
        migration: resolve(__dirname, '../../../../storage/migrations/**/*.{js,ts}'),
      },
      pg: {
        host: 'localhost',
        port: 5432,
        username: 'user_integration',
        password: 'user_integration',
        database: 'user_service',
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
  prefix: 'user',
} satisfies IntegrationConfig;
import { resolve } from "node:path";
import { AdminConfig } from "../../config";

export default {
  admin: {
    http: {
      port: 3000,
      cors: {
        origin: '*',
        methods: 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
        maxAge: 86400,
        allowedHeaders: 'Content-Type,Authorization,Accept-Language',
        optionsSuccessStatus: 200,
        credentials: true,
      },
      helmet: {
        xPoweredBy: false,
        referrerPolicy: { policy: 'no-referrer' },
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        crossOriginOpenerPolicy: { policy: 'same-origin' },
        crossOriginEmbedderPolicy: { policy: 'require-corp' },
        frameguard: { action: 'deny' },
        xContentTypeOptions: true,
        contentSecurityPolicy: false,
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        },
      },
      maxJSONBodySize: '10mb',
      cookie: {
        secret: 'test',
        options: {
          refresh: () => ({
            path: "/",
            signed: true,
            expires: new Date(Date.now() + 123123123212),
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
          }),
        },
      },
    },
    security: {
      password: {
        N: 32768, r: 8, p: 1,
        maxmem: 64 * 1024 * 1024,
      },
      jwt: {
        access: {
          secret: Buffer.from("access"),
          sign: { expiresIn: 5000, },
        },
        refresh: {
          secret: Buffer.from("refresh"),
          sign: { expiresIn: 5000, },
        },
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
        username: 'user_admin',
        password: 'user_admin',
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
} satisfies AdminConfig;
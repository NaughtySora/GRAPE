import { resolve } from "node:path";

const env = process.env;

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const config = {
  prefix: 'user',
  admin: {
    http: {
      port: parseInt(env.ADMIN_HTTP_PORT as string, 10),
      cors: {
        origin: env.ADMIN_HTTP_CORS_ORIGIN,
        methods: env.ADMIN_HTTP_CORS_METHODS,
        maxAge: parseInt(env.ADMIN_HTTP_CORS_MAX_AGE as string, 10),
        allowedHeaders: env.ADMIN_HTTP_CORS_ALLOW_HEADERS,
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
      maxJSONBodySize: env.ADMIN_JSON_MAX_BODY_SIZE,
      cookie: {
        secret: env.ADMIN_COOKIE_SECRET as string,
        options: {
          refresh: () => ({
            path: "/",
            signed: true,
            expires: new Date(Date.now() + SEVEN_DAYS),
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
          }),
        },
      },
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
        host: env.ADMIN_DB_HOST,
        port: parseInt(env.ADMIN_DB_PORT as string, 10),
        username: env.ADMIN_DB_USER,
        password: env.ADMIN_DB_PASSWORD,
        database: env.ADMIN_DB_NAME,
        pool: {
          max: 50,
          min: 5,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
          allowExitOnIdle: false,
        }
      },
    },
    security: {
      password: {
        N: 32768, r: 8, p: 1,
        maxmem: 64 * 1024 * 1024,
      },
      jwt: {
        access: {
          secret: Buffer.from(env.ADMIN_JWT_ACCESS_SECRET as string, 'base64'),
          sign: {
            expiresIn: parseInt(env.ADMIN_JWT_ACCESS_DURATION as string, 10),
          },
        },
        refresh: {
          secret: Buffer.from(env.ADMIN_JWT_REFRESH_SECRET as string, 'base64'),
          sign: {
            expiresIn: parseInt(env.ADMIN_JWT_REFRESH_DURATION as string, 10),
          },
        },
      }
    },
  },
} as const;

export type AdminConfig = typeof config;
export default config;

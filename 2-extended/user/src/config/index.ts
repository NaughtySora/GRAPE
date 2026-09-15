import { resolve } from "node:path";

const env = process.env;
// TODO add more env for monolith
const config = {
  service: {
    http: {
      port: 3003,
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
        secret: Buffer.from('QqiwUlUpRrFzCcxrr8teimn46+Aiw9PB61gp+Xik++yEVQZ98nJqCmECENGhlrqbbrSQJbPw6ziIjmGkgvILxQ==', 'base64'),
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
          secret: Buffer.from('access'),
          sign: {
            expiresIn: 500000,
          },
        },
        refresh: {
          secret: Buffer.from('refresh'),
          sign: {
            expiresIn: 500000,
          },
        },
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
        host: env.POSTGRES_HOST,
        port: parseInt(env.POSTGRES_PORT as string, 10),
        username: env.POSTGRES_USER,
        password: env.POSTGRES_PASSWORD,
        database: env.POSTGRES_DB,
        pool: {
          max: 50,
          min: 5,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
          allowExitOnIdle: false,
        }
      },
    },
  },
  prefix: 'user',
} as const;

export type UserConfig = typeof config;
export default config;
import { ErrorFilter } from "@/transport/http/ErrorFilter";
import { httpLogger } from "@/transport/http/httpLogger";
import { RequestLogger } from "@/transport/http/RequestLogger";
import ValidationPipe from "@/transport/http/ValidationPipe";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { logger } from "naughty-util";
import request from "supertest";
import { AuthController } from "../../auth/controller";
import { AuthService } from "../../auth/service";
import { Cookies } from "@/application/Cookies";
import { JWT } from "@/application/JWT";
import { Scrypt } from "passwords";
import { Config } from "@/config/Config";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import express from "express";
import config from "../mock/config";
import { PublicUserRepository } from "../../storage/repositories/PublicUserRepository";
import storage from "../mock/storage";
import test from "@/utils/test";
import { sign } from "cookie-signature";

describe('Auth e2e', () => {
  let app: INestApplication;
  let service: AuthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: Config,
          useValue: new Config(config)
        },
        AuthService,
        {
          provide: Scrypt,
          useValue: new Scrypt(config.public.security.password)
        },
        {
          provide: JWT,
          useValue: new JWT(config.public.security.jwt)
        },
        {
          provide: Cookies,
          useValue: new Cookies(config.public.http.cookie.options)
        },
        {
          provide: PublicUserRepository,
          useClass: storage.MockPublicUserRepository,
        }
      ],
    })
      .compile();
    app = module.createNestApplication();
    service = module.get(AuthService);
    const requestLogger = httpLogger.bind(null, logger);
    app.useGlobalFilters(new ErrorFilter(requestLogger));
    app.useGlobalInterceptors(new RequestLogger(requestLogger));
    app.setGlobalPrefix('user');
    app.useGlobalPipes(new ValidationPipe());
    app.use(helmet(config.public.http.helmet));
    app.use(express.json({ limit: config.public.http.maxJSONBodySize, }));
    app.use(cookieParser(config.public.http.cookie.secret));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('signUp', async () => {
    await request(app.getHttpServer())
      .post('/user/public/auth/account')
      .send({
        email: 'naughtysora@proton.me',
        password: '!aA1234567',
        confirm: '!aA1234567'
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/user/public/auth/account')
      .send({
        email: 'naughtysora@proton.me',
        password: '!aA1234567',
        confirm: '^aA1234567'
      })
      .expect(400);
  });

  it('signIn', async () => {
    const creds = {
      email: test.random.email(),
      password: '!aA1234567',
      confirm: '!aA1234567'
    };
    await request(app.getHttpServer())
      .post('/user/public/auth/account')
      .send(creds)
      .expect(201);
    await request(app.getHttpServer())
      .post('/user/public/auth/session')
      .send({
        email: creds.email,
        password: creds.password,
      })
      .expect(201);
    await request(app.getHttpServer())
      .post('/user/public/auth/session')
      .send({
        email: creds.email,
        password: 'asdasd!Aa123',
      })
      .expect(400);
  });

  it('logout', async () => {
    const del = await request(app.getHttpServer())
      .delete('/user/public/auth/session')
      .expect(200);

    expect(del.headers['set-cookie'][0].startsWith('refresh=;'))
      .toBe(true);
  });

  it('restore', async () => {
    const { promise, resolve, } = Promise.withResolvers();

    const res = {
      async cookie(_, token: string) {
        const refresh = `s:${sign(token, config.public.http.cookie.secret)}`;
        const res = await request(app.getHttpServer())
          .get('/user/public/auth/session')
          .set('Cookie', [`refresh=${refresh}`])
          .expect(200);
        resolve(res.body);
      },
    } as any;
    await service.signUp(res, {
      email: test.random.email(),
      password: '!aA1234567',
    });
    await promise;
  });

  it('refresh', async () => {
    const { promise, resolve, } = Promise.withResolvers();

    const res = {
      async cookie(_, token: string) {
        const refresh = `s:${sign(token, config.public.http.cookie.secret)}`;
        const res = await request(app.getHttpServer())
          .get('/user/public/auth/session/token')
          .set('Cookie', [`refresh=${refresh}`])
          .expect(200);
        resolve(res.body);
      },
    } as any;
    await service.signUp(res, {
      email: test.random.email(),
      password: '!aA1234567',
    });
    await promise;
  });
});
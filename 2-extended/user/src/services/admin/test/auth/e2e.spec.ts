import { ErrorFilter } from "@/transport/http/ErrorFilter";
import { httpLogger } from "@/transport/http/httpLogger";
import { RequestLogger } from "@/transport/http/RequestLogger";
import ValidationPipe from "@/transport/http/ValidationPipe";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { logger } from "naughty-util";
import request from "supertest";
import { AdminAuthController } from "../../auth/controller";
import { AdminAuthService } from "../../auth/service";
import { Cookies } from "@/application/Cookies";
import { JWT } from "@/application/JWT";
import { Scrypt } from "passwords";
import { Config } from "@/config/Config";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import express from "express";
import config from "../mock/config";
import { AdminUserRepository } from "../../storage/repositories/AdminUserRepository";
import storage from "../mock/storage";
import test from "@/utils/test";
import { sign } from "cookie-signature";
import { UserRole } from "@/types";

describe('Auth e2e', () => {
  let app: INestApplication;
  let userRepo: AdminUserRepository;
  let passwordHasher: Scrypt;
  let jwt: JWT;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAuthController],
      providers: [
        {
          provide: Config,
          useValue: new Config(config)
        },
        AdminAuthService,
        {
          provide: Scrypt,
          useValue: new Scrypt(config.admin.security.password)
        },
        {
          provide: JWT,
          useValue: new JWT(config.admin.security.jwt)
        },
        {
          provide: Cookies,
          useValue: new Cookies(config.admin.http.cookie.options)
        },
        {
          provide: AdminUserRepository,
          useClass: storage.MockPublicUserRepository,
        }
      ],
    }).compile();
    app = module.createNestApplication();
    userRepo = module.get(AdminUserRepository);
    passwordHasher = module.get(Scrypt);
    jwt = module.get(JWT);
    const requestLogger = httpLogger.bind(null, logger);
    app.useGlobalFilters(new ErrorFilter(requestLogger));
    app.useGlobalInterceptors(new RequestLogger(requestLogger));
    app.setGlobalPrefix('user');
    app.useGlobalPipes(new ValidationPipe());
    app.use(helmet(config.admin.http.helmet));
    app.use(express.json({ limit: config.admin.http.maxJSONBodySize, }));
    app.use(cookieParser(config.admin.http.cookie.secret));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('signIn', async () => {
    const creds = {
      email: test.random.email(),
      password: '!aA1234567',
    };
    const hash = await passwordHasher.hash(creds.password);
    await userRepo.create({ email: creds.email, hash });
    await request(app.getHttpServer())
      .post('/user/admin/auth/session')
      .send(creds)
      .expect(201);
    await request(app.getHttpServer())
      .post('/user/admin/auth/session')
      .send({ email: creds.email, password: 'asdasd!Aa123', })
      .expect(400);
  });

  it('logout', async () => {
    const del = await request(app.getHttpServer())
      .delete('/user/admin/auth/session')
      .expect(200);

    expect(del.headers['set-cookie'][0].startsWith('refresh=;'))
      .toBe(true);
  });

  it('restore', async () => {
    const id = await userRepo.create({ email: test.random.email(), hash: 'abc' });
    const token = jwt.refresh({ id, role: UserRole.ADMIN });
    const refresh = `s:${sign(token, config.admin.http.cookie.secret)}`;
    await request(app.getHttpServer())
      .get('/user/admin/auth/session')
      .set('Cookie', [`refresh=${refresh}`])
      .expect(200);
  });

  it('refresh', async () => {
    const id = await userRepo.create({ email: test.random.email(), hash: 'abc' });
    const token = jwt.refresh({ id, role: UserRole.ADMIN });
    const refresh = `s:${sign(token, config.admin.http.cookie.secret)}`;
    await request(app.getHttpServer())
      .get('/user/admin/auth/session/token')
      .set('Cookie', [`refresh=${refresh}`])
      .expect(200);
  });
});
import { ErrorFilter } from "@/transport/http/ErrorFilter";
import { httpLogger } from "@/transport/http/httpLogger";
import { RequestLogger } from "@/transport/http/RequestLogger";
import ValidationPipe from "@/transport/http/ValidationPipe";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { logger } from "naughty-util";
import request from "supertest";
import { JWT } from "@/application/JWT";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import express from "express";
import config from "../mock/config";
import { PublicUserRepository } from "../../storage/repositories/PublicUserRepository";
import storage from "../mock/storage";
import { ProfileController } from "../../profile/controller";
import { ProfileService } from "../../profile/service";
import test from "@/utils/test";

describe('Auth e2e', () => {
  let app: INestApplication;
  let jwt: JWT;
  let userRepo: PublicUserRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        ProfileService,
        {
          provide: PublicUserRepository,
          useClass: storage.MockPublicUserRepository,
        },
        {
          provide: JWT,
          useValue: new JWT(config.public.security.jwt)
        },
      ],
    })
      .compile();
    const requestLogger = httpLogger.bind(null, logger);
    app = module.createNestApplication();
    jwt = module.get(JWT);
    userRepo = module.get(PublicUserRepository);
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

  it('upsert address', async () => {
    const id = await userRepo.create({ email: test.random.email(), hash: '123' });
    const token = jwt.access({ id })
    await request(app.getHttpServer())
      .post('/user/public/profile/address')
      .set('Authorization', `Bearer ${token}`)
      .send({ zipcode: 'a123b' })
      .expect(201);
  });

  it('update profile', async () => {
    const id = await userRepo.create({ email: test.random.email(), hash: '123' });
    const token = jwt.access({ id })
    await request(app.getHttpServer())
      .patch('/user/public/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'test' })
      .expect(200);
  });

  it('get profile', async () => {
    const id = await userRepo.create({ email: test.random.email(), hash: '123' });
    const token = jwt.access({ id })
    await request(app.getHttpServer())
      .patch('/user/public/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'test' })
      .expect(200);

    await request(app.getHttpServer())
      .get('/user/public/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
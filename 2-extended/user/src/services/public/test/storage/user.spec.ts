import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PublicUserRepository } from "../../storage/repositories/PublicUserRepository";
import { UserAddressSchema, UserSchema } from "@/storage/schemas/UserSchema";
import test from "@/utils/test";
import error from "@/utils/error";
import config from "../mock/config";

const { public: { storage: { orm, pg } } } = config;

const schemas = [
  UserSchema,
  UserAddressSchema,
];

describe('PublicUserRepository', () => {
  let app;
  let repo: PublicUserRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          host: pg.host,
          port: pg.port,
          username: pg.username,
          password: pg.password,
          database: pg.database,
          schema: pg.database,
          type: orm.type,
          entities: schemas,
          synchronize: false,
          dropSchema: false,
        }),
        TypeOrmModule.forFeature(schemas),
      ],
      providers: [
        PublicUserRepository,
      ],
    })
      .compile();
    repo = module.get(PublicUserRepository);
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('create', async () => {
    const id = await repo.create(
      {
        email: test.random.email(),
        hash: '123'
      });
    expect(typeof id).toBe('string');
  });

  it('hash', async () => {
    const hash = '123';
    const id = await repo.create({ email: test.random.email(), hash });
    const res = await repo.hash({ id });
    error.throwNullable(res);
    expect(res.hash).toBe(hash);
  });

  it('exists', async () => {
    const id = await repo.create({ email: test.random.email(), hash: '123' });
    const truth = await repo.exists({ id });
    expect(truth).toBeTruthy();
    const falsy = await repo.exists({ id: test.random.uuid() });
    expect(falsy).toBeFalsy();
  });

  it('upsertAddress', async () => {
    const id = await repo.create({ email: test.random.email(), hash: '123' });
    const res = await repo.upsertAddress(id, {
      city: 'abc',
      country: 'abc',
      street_address: '33abc',
      zipcode: 'abc123',
    });
    expect(res.city).toBeDefined();
    expect(res.state).toBeDefined();
    expect(res.zipcode).toBeDefined();
    expect(res.country).toBeDefined();
    expect(res.street_address).toBeDefined();
  });

  it('updateProfile', async () => {
    const id = await repo.create({ email: test.random.email(), hash: '123' });
    const res = await repo.updateProfile(id, {
      first_name: 'test',
      last_name: 'testofsky',
    });
    error.throwNullable(res);
    expect(res.first_name).toBeDefined();
    expect(res.last_name).toBeDefined();
    const res1 = await repo.updateProfile(test.random.uuid(),
      { first_name: 'a', last_name: 'b' });
    expect(res1).toBe(null);
  });

  it('profile', async () => {
    const id = await repo.create({ email: test.random.email(), hash: '123' });
    await repo.upsertAddress(id, {
      city: 'abc',
      country: 'abc',
      street_address: '33abc',
      zipcode: 'abc123',
    });
    await repo.updateProfile(id, {
      first_name: 'test',
      last_name: 'testofsky',
    });
    const res = await repo.profile({ id });
    error.throwNullable(res);
    expect(res.first_name).toBeDefined();
    expect(res.last_name).toBeDefined();
    expect(res.city).toBeDefined();
    expect(res.state).toBeDefined();
    expect(res.zipcode).toBeDefined();
    expect(res.country).toBeDefined();
    expect(res.street_address).toBeDefined();

    const res1 = await repo.profile({ id: test.random.uuid() });
    expect(res1).toBe(null);
  });
});
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserAddressSchema, UserSchema } from "@/storage/schemas/UserSchema";
import test from "@/utils/test";
import config from "../mock/config";
import { IntegrationUserRepository } from "../../storage/repositories/IntegrationUserRepository";

const { integration: { storage: { orm, pg } } } = config;

const schemas = [
  UserSchema,
  UserAddressSchema,
];

describe('PublicUserRepository', () => {
  let app;
  let repo: IntegrationUserRepository;

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
        IntegrationUserRepository,
      ],
    })
      .compile();
    repo = module.get(IntegrationUserRepository);
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('billingAddress', async () => {
    const id = await repo.create({ email: test.random.email(), hash: "123" });
    const address = await repo.billingAddress(id);
    expect(address).toBeDefined();
  });
});
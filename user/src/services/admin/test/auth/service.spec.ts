import { Test, TestingModule } from "@nestjs/testing";
import { AdminAuthService } from "../../auth/service";
import { JWT } from "@/application/JWT";
import { Cookies } from "@/application/Cookies";
import { Config } from "@/config/Config";
import { Scrypt } from "passwords";
import config from "../mock/config";
import { AdminUserRepository } from "../../storage/repositories/AdminUserRepository";
import storage from "../mock/storage";
import { UserRole } from "@/types";

describe('Auth Service', () => {
  let service: AdminAuthService;
  let userRepo: AdminUserRepository;
  let passwordHasher: Scrypt;
  let jwt: JWT;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: Config,
          useValue: new Config(config)
        },
        {
          provide: Scrypt,
          useValue: new Scrypt(config.admin.security.password),
        },
        AdminAuthService,
        {
          provide: JWT,
          useValue: new JWT(config.admin.security.jwt),
        },
        {
          provide: Cookies,
          useValue: new Cookies({
            refresh: () => ({
              path: "/",
              signed: true,
              expires: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000),
              httpOnly: true,
              secure: true,
              sameSite: 'strict',
            }),
          }),
        },
        {
          provide: AdminUserRepository,
          useClass: storage.MockPublicUserRepository,
        }
      ],
    })
      .compile();
    service = module.get(AdminAuthService);
    userRepo = module.get(AdminUserRepository);
    passwordHasher = module.get(Scrypt);
    jwt = module.get(JWT);
  });

  it('signIn', async () => {
    const response = {
      cookie(key, token) {
        expect(key).toBe('refresh');
        expect(typeof token).toBe('string');
      },
    } as any;
    const email = 'naughtysora@proton1.me';
    const password = '!Aa12345678';
    expect(async () => await service.signIn(response, { email, password }))
      .rejects.toThrow('Can\'t find target account');
    const hash = await passwordHasher.hash(password);
    await userRepo.create({ email, hash });
    expect(async () => await service.signIn(
      response,
      { email, password: '%Aa12345678' }
    )).rejects.toThrow('Wrong credentials');
    const spy = jest.spyOn(response, 'cookie');
    const res = await service.signIn(response, { email, password });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(typeof res.access).toBe('string');
    expect(typeof res.user.id).toBe('string');
  });

  it('logout', async () => {
    const response = {
      clearCookie(key) {
        expect(key).toBe('refresh');
      }
    } as any;
    const spy = jest.spyOn(response, 'clearCookie');
    await service.logout(response);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('refresh', async () => {
    const id = await userRepo.create({
      email: 'naughtysora@proton2.me', hash: 'abc'
    });
    const token = jwt.refresh({ id, role: UserRole.ADMIN });
    const req = { signedCookies: { refresh: token } } as any;
    const res = {
      cookie(key, token) {
        expect(key).toBe('refresh');
        expect(typeof token).toBe('string');
      }
    } as any;
    const spy = jest.spyOn(res, 'cookie');
    const payload = await service.refresh(req, res);
    expect(typeof payload.access).toBe('string');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('restore', async () => {
    const id = await userRepo.create({
      email: 'naughtysora@proton3.me', hash: 'abc'
    });
    const token = jwt.refresh({ id, role: UserRole.ADMIN });
    const req = { signedCookies: { refresh: token } } as any;
    const res = {
      cookie(key, token) {
        expect(key).toBe('refresh');
        expect(typeof token).toBe('string');
      }
    } as any;
    const spy = jest.spyOn(res, 'cookie');
    const payload = await service.restore(req, res);
    expect(typeof payload.access).toBe('string');
    expect(typeof payload.user.id).toBe('string');
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
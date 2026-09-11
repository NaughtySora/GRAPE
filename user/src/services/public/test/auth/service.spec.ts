import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../../auth/service";
import { JWT } from "@/application/JWT";
import { Cookies } from "@/application/Cookies";
import { Config } from "@/config/Config";
import { Scrypt } from "passwords";
import config from "../mock/config";
import { PublicUserRepository } from "../../storage/repositories/PublicUserRepository";
import storage from "../mock/storage";

describe('Auth Service', () => {
  let service: AuthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: Config,
          useValue: new Config(config)
        },
        {
          provide: Scrypt,
          useValue: new Scrypt(config.public.security.password),
        },
        AuthService,
        {
          provide: JWT,
          useValue: new JWT(config.public.security.jwt),
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
          provide: PublicUserRepository,
          useClass: storage.MockPublicUserRepository,
        }
      ],
    })
      .compile();
    service = module.get(AuthService);
  });

  it('signUp', async () => {
    const response = {
      cookie(key, token) {
        expect(key).toBe('refresh');
        expect(typeof token).toBe('string');
      },
    } as any;
    const spy = jest.spyOn(response, 'cookie');
    const res = await service.signUp(
      response,
      { email: 'naughtysora@proton.me', password: '!Aa12345678' }
    );
    expect(spy).toHaveBeenCalledTimes(1);
    expect(typeof res.access).toBe('string');
    expect(typeof res.user.id).toBe('string');
  });

  it('signIn', async () => {
    const response = {
      cookie(key, token) {
        expect(key).toBe('refresh');
        expect(typeof token).toBe('string');
      },
    } as any;
    expect(async () => await service.signIn(
      response,
      { email: 'naughtysora@proton1.me', password: '!Aa12345678' }
    )).rejects.toThrow('Can\'t find target account');
    await service.signUp(
      response,
      { email: 'naughtysora@proton1.me', password: '!Aa12345678' }
    );
    expect(async () => await service.signIn(
      response,
      { email: 'naughtysora@proton1.me', password: '%Aa12345678' }
    )).rejects.toThrow('Wrong credentials');
    const spy = jest.spyOn(response, 'cookie');
    const res = await service.signIn(
      response,
      { email: 'naughtysora@proton1.me', password: '!Aa12345678' }
    );
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
    await service.signUp(
      {
        async cookie(key, token) {
          const req = {
            signedCookies: { [key]: token }
          } as any;
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
        },
      } as any,
      { email: 'naughtysora@proton2.me', password: '!Aa12345678' }
    );
  });

  it('restore', async () => {
    await service.signUp(
      {
        async cookie(key, token) {
          const req = {
            signedCookies: { [key]: token }
          } as any;
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
        },
      } as any,
      { email: 'naughtysora@proton3.me', password: '!Aa12345678' }
    );
  });
});
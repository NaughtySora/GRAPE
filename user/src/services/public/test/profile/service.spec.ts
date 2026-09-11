import { Test, TestingModule } from "@nestjs/testing";
import { PublicUserRepository } from "../../storage/repositories/PublicUserRepository";
import storage from "../mock/storage";
import { ProfileService } from "../../profile/service";
import test from "@/utils/test";

describe('Profile Service', () => {
  let service: ProfileService;
  let userRepo: PublicUserRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: PublicUserRepository,
          useClass: storage.MockPublicUserRepository,
        }
      ],
    })
      .compile();
    service = module.get(ProfileService);
    userRepo = module.get(PublicUserRepository);
  });

  it('profile', async () => {
    const id = await userRepo.create(
      { email: test.random.email(), hash: 'asd' });
    await service.profile(id);
  });

  it('upsertAddress', async () => {
    const id = await userRepo.create(
      { email: test.random.email(), hash: 'asd' });
    const data = await service.upsertAddress(id, {
      city: 'city',
      country: 'country',
      street_address: 'street_address',
      zipcode: 'zipcode',
    });
    expect(data?.city).toBe('city');
    expect(data?.country).toBe('country');
    expect(data?.street_address).toBe('street_address');
    expect(data?.zipcode).toBe('zipcode');
  });

  it('updateProfile', async () => {
    const id = await userRepo.create(
      { email: test.random.email(), hash: 'asd' });
    await service.updateProfile(id, {
      first_name: 'a', last_name: 'b',
    });
    const data = await service.profile(id);
    expect(data?.first_name).toBe('a');
    expect(data?.last_name).toBe('b');
  });

});
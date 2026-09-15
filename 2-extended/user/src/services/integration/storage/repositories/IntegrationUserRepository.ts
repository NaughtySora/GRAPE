import { UserAddressSchema, UserSchema } from "@/storage/schemas/UserSchema";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere } from "typeorm";

type Where = FindOptionsWhere<UserSchema>;

interface BillingAddress {
  firstName: null | string;
  lastName: null | string;
  city: null | string;
  address: null | string;
  country: null | string;
  zipcode: null | string;
  state: null | string;
}

type CreateUser = Pick<UserSchema, "hash" | "email">;

@Injectable()
export class IntegrationUserRepository {
  constructor(
    @InjectRepository(UserSchema)
    private readonly user: Repository<UserSchema>,
    @InjectRepository(UserAddressSchema)
    private readonly address: Repository<UserAddressSchema>,
  ) { }

  async create(user: CreateUser): Promise<string> {
    const created = await this.user.insert(user);
    return created.raw[0].id;
  }


  async billingAddress(id: string): Promise<null | BillingAddress> {
    const res = await this.user
      .createQueryBuilder("user")
      .leftJoin(UserAddressSchema, "address", "address.id = user.id")
      .where("user.id = :id", { id })
      .select("user.first_name", "first_name")
      .addSelect("user.last_name", "last_name")
      .addSelect("address.city", "city")
      .addSelect("address.state", "state")
      .addSelect("address.street_address", "address")
      .addSelect("address.country", "country")
      .addSelect("address.zipcode", "zipcode")
      .getRawOne();
    return res ?? null;
  }
}
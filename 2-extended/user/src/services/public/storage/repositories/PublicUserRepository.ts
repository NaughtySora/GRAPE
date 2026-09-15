import { SharedUserRepository } from "@/storage/repositories/ShareUserRepository";
import { UserAddressSchema, UserSchema } from "@/storage/schemas/UserSchema";
import { Injectable } from "@nestjs/common";
import { FindOptionsWhere } from "typeorm";

type UpdateAddress = Partial<Pick<UserAddressSchema, "city" | "country" | "state" |
  "street_address" | "zipcode">>;

type UpdateProfile = Partial<Pick<UserSchema, "first_name" | "last_name">>;

type Where = FindOptionsWhere<UserSchema>;

type Profile = Pick<UserSchema, "first_name" | "last_name"> &
  Pick<UserAddressSchema, "city" | "country" | "state" | "street_address" | "zipcode">;

@Injectable()
export class PublicUserRepository extends SharedUserRepository {

  async upsertAddress(
    id: string, address: UpdateAddress
  ): Promise<{
    city: string,
    country: string,
    street_address: string,
    zipcode: string,
    state: null | string
  }> {
    const result = await this.address
      .createQueryBuilder()
      .insert()
      .into(UserAddressSchema)
      .values({ id, ...address })
      .orUpdate(Object.keys(address), ["id"])
      .returning("city,country,street_address,zipcode,state")
      .execute();
    return result.raw[0];
  }

  async updateProfile(
    id: string, profile: UpdateProfile
  ): Promise<null | { first_name: string; last_name: string }> {
    const result = await this.user
      .createQueryBuilder()
      .update()
      .set(profile)
      .where("id = :id", { id })
      .returning("first_name,last_name")
      .execute();
    if (result.affected === 0) return null;
    return result.raw[0];
  }

  async profile(where: Where): Promise<null | Profile> {
    const res = await this.user
      .createQueryBuilder("user")
      .leftJoin(UserAddressSchema, "address", "address.id = user.id")
      .where(where)
      .select("user.first_name", "first_name")
      .addSelect("user.last_name", "last_name")
      .addSelect("address.city", "city")
      .addSelect("address.state", "state")
      .addSelect("address.street_address", "street_address")
      .addSelect("address.country", "country")
      .addSelect("address.zipcode", "zipcode")
      .getRawOne();
    return res ?? null;
  }
}
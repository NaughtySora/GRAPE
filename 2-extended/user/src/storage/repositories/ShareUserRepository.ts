import { FindOptionsWhere, Repository } from "typeorm";
import { UserAddressSchema, UserSchema } from "../schemas/UserSchema";
import { InjectRepository } from "@nestjs/typeorm";

type CreateUser = Pick<UserSchema, "hash" | "email">;
type Where = FindOptionsWhere<UserSchema>;

export class SharedUserRepository {
  constructor(
    @InjectRepository(UserSchema)
    protected readonly user: Repository<UserSchema>,
    @InjectRepository(UserAddressSchema)
    protected readonly address: Repository<UserAddressSchema>,
  ) { }

  async create(user: CreateUser): Promise<string> {
    const created = await this.user.insert(user);
    return created.raw[0].id;
  }

  async hash(where: Where): Promise<null | { hash: string, id: string }> {
    return await this.user.findOne({
      where,
      select: SharedUserRepository.SELECT_HASH,
    });
  }

  async exists(where: Where) {
    return await this.user.exists({ where });
  }

  private static SELECT_HASH = { hash: true, id: true };
}
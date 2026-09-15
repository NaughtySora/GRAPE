import { Injectable } from "@nestjs/common";
import { Address, Profile } from "./dto";
import { PublicUserRepository } from "../storage/repositories/PublicUserRepository";
import { error } from "naughty-util";

const { DomainError } = error;

@Injectable()
export class ProfileService {
  constructor(
    private readonly userRepository: PublicUserRepository
  ) { }

  async upsertAddress(id: string, data: Address) {
    try {
      return await this.userRepository.upsertAddress(id, data);
    } catch (e) {
      throw new DomainError(
        'Error while upserting user address',
        { cause: e, details: { data, id } }
      )
    }
  }

  async updateProfile(id: string, data: Profile) {
    try {
      return await this.userRepository.updateProfile(id, data);
    } catch (e) {
      throw new DomainError(
        'Error while updating user profile',
        { cause: e, details: { data, id } }
      )
    }
  }

  async profile(id: string) {
    try {
      return await this.userRepository.profile({ id });
    } catch (e) {
      throw new DomainError(
        'Error while getting user profile',
        { cause: e, details: { id } }
      )
    }
  }
}
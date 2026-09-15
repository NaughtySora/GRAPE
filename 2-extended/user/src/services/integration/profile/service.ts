import { Injectable } from "@nestjs/common";
import { IntegrationUserRepository } from "../storage/repositories/IntegrationUserRepository";
import { ApplicationContract } from "../contract";
import { BillingQuery } from "./dto";

@Injectable()
export class IntegrationProfileService {
  constructor(
    private readonly userRepo: IntegrationUserRepository,
  ) { }

  async billingAddress(query: BillingQuery) {
    try {
      const address = await this.userRepo.billingAddress(query.id);
      if (address === null) {
        return ApplicationContract.notFound('User doesn\'t exist');
      }
      return ApplicationContract.success(address);
    } catch (e: any) {
      return ApplicationContract.fail(e, 
        'Error while getting billing address', query,);
    }
  }
}
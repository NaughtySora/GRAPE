import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { IntegrationProfileService } from "./service";
import { HMACGuard } from "@/transport/http/HMACGuard";
import { BillingQuery } from "./dto";

@Controller("integration/profile")
export class IntegrationProfileController {
  constructor(
    private readonly service: IntegrationProfileService
  ) { }

  @Get('billing')
  @UseGuards(HMACGuard)
  async address(@Query() query: BillingQuery) {
    return this.service.billingAddress(query);
  }
}

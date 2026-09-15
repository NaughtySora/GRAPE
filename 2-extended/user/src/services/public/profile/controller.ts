import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { ProfileService } from "./service";
import { JWTGuard } from "@/transport/http/JWTGuard";
import { Identity, UserIdentity } from "@/transport/http/UserIdentity";
import { JWTToken } from "@/transport/http/JWTToken";
import { Address, Profile } from "./dto";

@Controller("public/profile")
export class ProfileController {
  constructor(private readonly service: ProfileService) { }

  @Post('address')
  @UseGuards(JWTGuard)
  @JWTToken('access')
  async address(
    @UserIdentity() user: Identity,
    @Body() body: Address,
  ) {
    return await this.service.upsertAddress(user.id, body);
  }

  @Patch()
  @UseGuards(JWTGuard)
  @JWTToken('access')
  async updateProfile(
    @UserIdentity() user: Identity,
    @Body() body: Profile,
  ) {
    return await this.service.updateProfile(user.id, body);
  }

  @Get()
  @UseGuards(JWTGuard)
  @JWTToken('access')
  async profile(@UserIdentity() user: Identity) {
    return await this.service.profile(user.id);
  }
}

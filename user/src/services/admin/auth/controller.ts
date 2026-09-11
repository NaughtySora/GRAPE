import { Body, Controller, Delete, Get, Post, Req, Res } from "@nestjs/common";
import { AdminAuthService } from "./service";
import { Request, Response } from "express";
import { SignInCredentials } from "./dto";

@Controller("admin/auth")
export class AdminAuthController {
  constructor(private readonly service: AdminAuthService) { }

  @Post('session')
  async signIn(
    @Res({ passthrough: true }) res: Response,
    @Body() body: SignInCredentials,
  ) {
    return await this.service.signIn(res, body);
  }

  @Delete('session')
  async logout(
    @Res({ passthrough: true }) res: Response,
  ) {
    this.service.logout(res);
  }

  @Get('session')
  async restore(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.service.restore(req, res);
  }

  @Get('session/token')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.service.refresh(req, res);
  }
}

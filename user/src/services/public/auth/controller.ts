import { Controller, Delete, Get, Req, Res, Headers, Post, Body } from "@nestjs/common";
import { AuthService } from "./service";
import { Response, Request } from "express";
import { SignInCredentials, SignUpCredentials } from "./dto";

@Controller("public/auth")
export class AuthController {
  constructor(
    private readonly service: AuthService,
  ) { }

  @Post('account')
  async signUp(
    @Res({ passthrough: true }) res: Response,
    @Body() body: SignUpCredentials,
  ) {
    return await this.service.signUp(res, {
      email: body.email,
      password: body.password,
    });
  }

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

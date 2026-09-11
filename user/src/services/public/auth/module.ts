import { Module } from "@nestjs/common";
import { AuthService } from "./service";
import { AuthController } from "./controller";
import { Scrypt } from "passwords";
import { Config } from "@/config/Config";
import { PublicConfig } from "../config";
import { HTTPModule } from "../modules/http";

@Module({
  imports: [HTTPModule],
  providers: [
    AuthService,
    {
      provide: Scrypt,
      inject: [Config],
      useFactory: (config: Config<PublicConfig>) => {
        const options = config.get("public");
        return new Scrypt(options.security.password);
      },
    },
  ],
  controllers: [AuthController],
})
export class AuthModule { }
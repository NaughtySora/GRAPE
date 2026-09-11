import { Module } from "@nestjs/common";
import { AdminAuthController } from "./controller";
import { AdminAuthService } from "./service";
import { HTTPModule } from "../modules/http";
import { Scrypt } from "passwords";
import { Config } from "@/config/Config";
import { AdminConfig } from "../config";

@Module({
  imports: [HTTPModule],
  controllers: [AdminAuthController],
  providers: [
    {
      provide: Scrypt,
      inject: [Config],
      useFactory: (config: Config<AdminConfig>) => {
        const options = config.get("admin");
        return new Scrypt(options.security.password);
      },
    },
    AdminAuthService
  ],
})
export class AdminAuthModule { }
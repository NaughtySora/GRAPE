import { JWT } from "@/application/JWT";
import { Config } from "@/config/Config";
import { Module } from "@nestjs/common";
import { Cookies } from "@/application/Cookies";
import { AdminConfig } from "../config";

@Module({
  providers: [
    {
      provide: JWT,
      inject: [Config],
      useFactory: (config: Config<AdminConfig>) => {
        const options = config.get("admin");
        return new JWT(options.security.jwt);
      },
    },
    {
      provide: Cookies,
      inject: [Config],
      useFactory: (config: Config<AdminConfig>) => {
        const options = config.get("admin");
        return new Cookies(options.http.cookie.options);
      },
    }
  ],
  exports: [JWT, Cookies],
})
export class HTTPModule { }
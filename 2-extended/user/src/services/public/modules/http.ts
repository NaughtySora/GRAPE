import { JWT } from "@/application/JWT";
import { Config } from "@/config/Config";
import { Module } from "@nestjs/common";
import { PublicConfig } from "../config";
import { Cookies } from "@/application/Cookies";

@Module({
  providers: [
    {
      provide: JWT,
      inject: [Config],
      useFactory: (config: Config<PublicConfig>) => {
        const options = config.get("public");
        return new JWT(options.security.jwt);
      },
    },
    {
      provide: Cookies,
      inject: [Config],
      useFactory: (config: Config<PublicConfig>) => {
        const options = config.get("public");
        return new Cookies(options.http.cookie.options);
      },
    }
  ],
  exports: [JWT, Cookies],
})
export class HTTPModule { }
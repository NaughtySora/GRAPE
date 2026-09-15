import { Global, Module } from "@nestjs/common";
import config from ".";
import { Config } from "@/config/Config";

@Global()
@Module({
  providers: [{
    provide: Config,
    useValue: new Config(config),
  }],
  exports: [Config],
})
export class ConfigModule { }
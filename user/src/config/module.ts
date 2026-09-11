import { Global, Module } from "@nestjs/common";
import { Config } from "./Config";
import config from ".";

@Global()
@Module({
  providers: [{
    provide: Config,
    useValue: new Config(config),
  }],
  exports: [Config],
})
export class ConfigModule { }
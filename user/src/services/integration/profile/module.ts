import { Module } from "@nestjs/common";
import { IntegrationProfileController } from "./controller";
import { IntegrationProfileService } from "./service";
import { ISCSignature } from "@/application/ISCSignature";
import { Config } from "@/config/Config";
import { IntegrationConfig } from "../config";

@Module({
  controllers: [IntegrationProfileController],
  providers: [
    {
      provide: ISCSignature,
      inject: [Config],
      useFactory(config: Config<IntegrationConfig>) {
        const { security: { signature } } = config.get("integration");
        return new ISCSignature(signature);
      },
    },
    IntegrationProfileService
  ],
})
export class IntegrationProfileModule { }
import { Module } from "@nestjs/common";
import { PublicModule } from "./services/public/module";
import { IntegrationModule } from "./services/integration/module";
import { ConfigModule } from "./config/module";
import { AdminModule } from "./services/admin/module";

@Module({
  imports: [
    PublicModule, 
    IntegrationModule, 
    AdminModule,
    ConfigModule
  ],
})
export class AppModule {}
import {  Module } from "@nestjs/common";
import { ConfigModule } from "./config/module";
import { IntegrationProfileModule } from "./profile/module";
import { StorageModule } from "./storage/module";

@Module({
  imports: [
    StorageModule,
    ConfigModule,
    IntegrationProfileModule,
  ],
})
export class IntegrationModule { }
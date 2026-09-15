import {  Module } from "@nestjs/common";
import { ConfigModule } from "./config/module";
import { AdminAuthModule } from "./auth/module";
import { StorageModule } from "./storage/module";

@Module({
  imports: [
    StorageModule,
    ConfigModule,
    AdminAuthModule,
  ],
})
export class AdminModule { }
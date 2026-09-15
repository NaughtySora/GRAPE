import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/module";
import { ProfileModule } from "./profile/module";
import { ConfigModule } from "./config/module";
import { StorageModule } from "./storage/module";
import { HTTPModule } from "./modules/http";

@Module({
  imports: [
    HTTPModule,
    StorageModule,
    ConfigModule,
    AuthModule,
    ProfileModule,
  ],
})
export class PublicModule { }
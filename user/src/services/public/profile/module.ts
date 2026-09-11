import { Module } from "@nestjs/common";
import { ProfileService } from "./service";
import { ProfileController } from "./controller";
import { HTTPModule } from "../modules/http";

@Module({
  imports: [HTTPModule],
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule { }
import { IsString, IsUUID } from "class-validator";

export class BillingQuery {
  @IsString()
  @IsUUID()
  id: string;
}
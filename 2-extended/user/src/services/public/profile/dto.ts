import { decorators } from "@/dto";
import { IsOptional } from "class-validator";

export class Address {
  @IsOptional()
  @decorators.Zipcode()
  zipcode?: string;

  @IsOptional()
  @decorators.State()
  state?: string;

  @IsOptional()
  @decorators.City()
  city?: string;

  @IsOptional()
  @decorators.Country()
  country?: string;

  @IsOptional()
  @decorators.Address()
  street_address?: string;
}

export class Profile {
  @IsOptional()
  @decorators.Name()
  first_name?: string;

  @IsOptional()
  @decorators.Name()
  last_name?: string;
}
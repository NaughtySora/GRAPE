import { PASSWORD } from '@/dto';
import {
  IsEmail,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

export class SignInCredentials {
  @MaxLength(128)
  @IsEmail()
  email: string;

  @MaxLength(64)
  @IsStrongPassword(PASSWORD.settings, PASSWORD.options)
  password: string;
}
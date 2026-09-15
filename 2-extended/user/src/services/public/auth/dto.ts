import { Match, PASSWORD } from '@/dto';
import {
  IsEmail,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

export class SignUpCredentials {
  @MaxLength(128)
  @IsEmail()
  email: string;

  @MaxLength(64)
  @IsStrongPassword(PASSWORD.settings, PASSWORD.options)
  password: string;

  @MaxLength(64)
  @IsStrongPassword(PASSWORD.settings, PASSWORD.options)
  @Match('password', { message: 'Passwords do not match.' })
  confirm: string;
}

export class SignInCredentials {
  @MaxLength(128)
  @IsEmail()
  email: string;

  @MaxLength(64)
  @IsStrongPassword(PASSWORD.settings, PASSWORD.options)
  password: string;
}
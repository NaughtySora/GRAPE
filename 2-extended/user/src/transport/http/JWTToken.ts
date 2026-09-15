import { SetMetadata } from "@nestjs/common";

export const key = 'jwt';

export const JWTToken = (type: string) => SetMetadata(key, type);

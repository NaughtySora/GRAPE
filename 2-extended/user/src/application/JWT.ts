import { Injectable } from '@nestjs/common';
import { verify, sign, decode, JwtPayload } from "jsonwebtoken";
import { randomUUID } from 'node:crypto';

const TOKENS = Object.freeze({
  access: 'access',
  refresh: 'refresh',
});

interface TokenOptions {
  secret: Buffer<ArrayBuffer>;
  sign: Partial<Parameters<typeof sign>[2]>;
  verify?: Partial<Parameters<typeof verify>[2]>;
}

type Options = Record<keyof typeof TOKENS, TokenOptions>;

@Injectable()
export class JWT {
  tokens = TOKENS;

  constructor(private readonly options: Options) { }

  access(data: any) {
    return sign(
      { data, type: TOKENS.access, jit: randomUUID() },
      this.options.access.secret,
      this.options.access.sign,
    );
  }

  refresh(data: any) {
    return sign(
      { data, type: TOKENS.refresh, jit: randomUUID() },
      this.options.refresh.secret,
      this.options.refresh.sign,
    );
  }

  verify(token: string, expected?: string) {
    if (typeof token !== "string") {
      throw new Error("Token has to be a string");
    }
    const decoded = decode(token) as JwtPayload;
    if (decoded == null) {
      throw new Error('Token is malformed');
    }
    if (expected && decoded.type !== expected) {
      throw new Error('Expected token type');
    }
    if (!Object.hasOwn(this.options, decoded.type)) {
      throw new Error('JWTPayload unexpected type');
    }
    const verified = verify(
      token, this.options[decoded.type].secret
    ) as JwtPayload;
    return verified.data;
  }
}
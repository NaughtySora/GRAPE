import { Injectable } from "@nestjs/common";
import util from "naughty-util";
import { JWT } from "@/application/JWT";
import { Cookies } from "@/application/Cookies";
import { Scrypt } from "passwords";
import { Request, Response } from "express";
import { AdminUserRepository } from "../storage/repositories/AdminUserRepository";

const { DomainError, DescriptiveError } = util.error;

interface Credentials {
  email: string;
  password: string;
}

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly jwt: JWT,
    private readonly cookies: Cookies,
    private readonly password: Scrypt,
    private readonly userRepository: AdminUserRepository
  ) { }

  private session(payload: any, res: Response) {
    const access = this.jwt.access(payload);
    this.cookies.set(
      res,
      this.jwt.tokens.refresh,
      this.jwt.refresh(payload)
    );
    return access;
  }

  async signIn(res: Response, credentials: Credentials) {
    try {
      const user = await this.userRepository.hash(
        { email: credentials.email }
      );
      if (user === null) {
        throw new DescriptiveError('Can\'t find target account');
      }
      const match = await this.password.compare(
        credentials.password, user.hash
      );
      if (!match) {
        throw new DescriptiveError('Wrong credentials');
      }
      const access = this.session({ id: user.id }, res);
      return { access, user: { id: user.id }, };
    } catch (e) {
      throw new DomainError(
        'Error while signing in',
        { cause: e },
      ).adopt(DescriptiveError);
    }
  }

  async logout(res: Response) {
    try {
      this.cookies.delete(res, this.jwt.tokens.refresh);
    } catch (e) {
      throw new DomainError('Error while logout', { cause: e });
    }
  }

  async restore(req: Request, res: Response) {
    try {
      var data = this.jwt.verify(
        this.cookies.getSigned(req, this.jwt.tokens.refresh),
        this.jwt.tokens.refresh,
      );
      const exists = await this.userRepository.exists({ id: data.id, });
      if (!exists) throw new DescriptiveError('User doesn\'t exist');
      const access = this.session({ id: data.id }, res);
      return { access, user: { id: data.id } };
    } catch (e) {
      throw new DomainError(
        'Error while restoring session',
        { cause: e, details: data },
      ).adopt(DescriptiveError);
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      var data = this.jwt.verify(
        this.cookies.getSigned(req, this.jwt.tokens.refresh),
        this.jwt.tokens.refresh,
      );
      const exists = await this.userRepository.exists({ id: data.id, });
      if (!exists) throw new DescriptiveError('User doesn\'t exist');
      const access = this.session({ id: data.id }, res);
      return { access, };
    } catch (e) {
      throw new DomainError(
        'Error while refresh session',
        { cause: e, details: data },
      ).adopt(DescriptiveError);
    }
  }
}
import { Cookies } from "@/application/Cookies";
import { JWT } from "@/application/JWT";
import { Injectable } from "@nestjs/common";
import util from "naughty-util";
import { Response, Request } from "express";
import { Scrypt } from "passwords";
import { PublicUserRepository } from "../storage/repositories/PublicUserRepository";
import { UserRole } from "@/types";

const { DomainError, DescriptiveError } = util.error;

interface Credentials {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {

  constructor(
    private readonly jwt: JWT,
    private readonly cookies: Cookies,
    private readonly password: Scrypt,
    private readonly userRepository: PublicUserRepository,
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

  async signUp(res: Response, credentials: Credentials) {
    try {
      const exists = await this.userRepository.exists(
        { email: credentials.email }
      );
      if (exists) throw new DescriptiveError('Try different email');
      const hash = await this.password.hash(credentials.password);
      const id = await this.userRepository.create(
        { hash, email: credentials.email }
      );
      const access = this.session({ id, role: UserRole.USER }, res);
      return { access, user: { id }, };
    } catch (e) {
      throw new DomainError(
        'Error while signing up',
        { cause: e },
      ).adopt(DescriptiveError);
    }
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
      const access = this.session({ id: user.id, role: UserRole.USER }, res);
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
      const access = this.session({ id: data.id, role: UserRole.USER }, res);
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
      const access = this.session({ id: data.id, role: UserRole.USER }, res);
      return { access, };
    } catch (e) {
      throw new DomainError(
        'Error while refresh session',
        { cause: e, details: data },
      ).adopt(DescriptiveError);
    }
  }
}
import { SharedUserRepository } from "@/storage/repositories/ShareUserRepository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AdminUserRepository extends SharedUserRepository {}
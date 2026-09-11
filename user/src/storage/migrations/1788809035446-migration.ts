import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1788809035446 implements MigrationInterface {
    name = 'Migration1788809035446'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "user_service"."user_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`CREATE TABLE "user_service"."user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" citext NOT NULL, "role" "user_service"."user_role_enum" NOT NULL DEFAULT 'user', "hash" text NOT NULL, "first_name" character varying(64), "last_name" character varying(64), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_service"."user_address" ("id" uuid NOT NULL, "city" text NOT NULL, "state" text, "zipcode" text NOT NULL, "country" text NOT NULL, "street_address" text NOT NULL, CONSTRAINT "PK_302d96673413455481d5ff4022a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_service"."user_address" ADD CONSTRAINT "FK_302d96673413455481d5ff4022a" FOREIGN KEY ("id") REFERENCES "user_service"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_service"."user_address" DROP CONSTRAINT "FK_302d96673413455481d5ff4022a"`);
        await queryRunner.query(`DROP TABLE "user_service"."user_address"`);
        await queryRunner.query(`DROP TABLE "user_service"."user"`);
        await queryRunner.query(`DROP TYPE "user_service"."user_role_enum"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSavingsGoals1778259440853 implements MigrationInterface {
    name = 'AddSavingsGoals1778259440853'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "savings_goals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "target_amount" numeric(10,2) NOT NULL, "current_amount" numeric(10,2) NOT NULL DEFAULT '0', "deadline" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4f1e133521cfbf2b4252bd8f09d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "savings_goals" ADD CONSTRAINT "FK_acf18d62676b7b640f44cc6eba5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "savings_goals" DROP CONSTRAINT "FK_acf18d62676b7b640f44cc6eba5"`);
        await queryRunner.query(`DROP TABLE "savings_goals"`);
    }

}

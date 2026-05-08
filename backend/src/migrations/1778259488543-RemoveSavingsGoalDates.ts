import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveSavingsGoalDates1778259488543 implements MigrationInterface {
    name = 'RemoveSavingsGoalDates1778259488543'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "savings_goals" DROP COLUMN "deadline"`);
        await queryRunner.query(`ALTER TABLE "savings_goals" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "savings_goals" DROP COLUMN "updated_at"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "savings_goals" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "savings_goals" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "savings_goals" ADD "deadline" date`);
    }

}

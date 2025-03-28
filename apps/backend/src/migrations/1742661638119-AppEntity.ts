import { MigrationInterface, QueryRunner } from 'typeorm';

export class AppEntity1742661638119 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE applications (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              created_at TIMESTAMP DEFAULT now()
            );
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE applications;`);
  }
}

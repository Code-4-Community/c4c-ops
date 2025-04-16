import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ApplicationsRefactoring1743956381802
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'application',
      new TableColumn({
        name: 'recruiters',
        type: 'jsonb',
        isArray: true,
        isNullable: true,
        default: "'[]'",
      }),
    );

    await queryRunner.addColumn(
      'application',
      new TableColumn({
        name: 'numApps',
        type: 'integer',
        isNullable: false,
        default: 0,
      }),
    );

    await queryRunner.addColumn(
      'application',
      new TableColumn({
        name: 'eventsAttended',
        type: 'integer',
        default: 0,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('application', 'recruiters');
    await queryRunner.dropColumn('application', 'numApps');
    await queryRunner.dropColumn('application', 'eventsAttended');
  }
}

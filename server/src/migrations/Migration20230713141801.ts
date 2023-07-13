import { Migration } from '@mikro-orm/migrations';

export class Migration20230713141801 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "post" alter column "title" type text using ("title"::text);');
  }

  async down(): Promise<void> {
    this.addSql('alter table "post" alter column "title" type varchar(255) using ("title"::varchar(255));');
  }

}

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const dbUrl =
      process.env.DATABASE_URL || 'mysql://root:@localhost:3306/project_c';
    const connectionString = dbUrl.replace(/^mysql:/, 'mariadb:');
    const adapter = new PrismaMariaDb(connectionString);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

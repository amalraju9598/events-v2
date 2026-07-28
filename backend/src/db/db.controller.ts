import { Controller, Post, InternalServerErrorException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

@ApiTags('database')
@Controller('db')
export class DbController {
  @Post('migrate-and-seed')
  @ApiOperation({ summary: 'Run prisma migrate dev, prisma generate and prisma db seed' })
  async migrateAndSeed() {
    const cwd = path.resolve(__dirname, '../../');
    try {
      // Run the commands sequentially
      // Using npx to ensure local project installations of prisma are used
      const { stdout, stderr } = await execAsync(
        'npx prisma migrate dev && npx prisma generate && npx prisma db seed',
        { cwd },
      );

      return {
        success: true,
        message: 'Database migrated, generated, and seeded successfully.',
        stdout,
        stderr,
      };
    } catch (error: any) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to run database migration, generation, or seeding.',
        error: error.message,
        stdout: error.stdout,
        stderr: error.stderr,
      });
    }
  }
}

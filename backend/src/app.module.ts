import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EventTypesModule } from './event-types/event-types.module';
import { TemplatesModule } from './templates/templates.module';
import { FieldsModule } from './fields/fields.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    EventTypesModule,
    TemplatesModule,
    FieldsModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEventTypeDto {
  @ApiProperty({ example: 'Meeting', description: 'Name of the event type' })
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'Schedule meetings', description: 'Description of the event type' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'calendar', description: 'Icon of the event type' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ example: 'meeting-event', description: 'Unique identifier for the event type' })
  @IsString()
  @IsNotEmpty()
  identifier?: string;


  @ApiPropertyOptional({ example: 'user-uuid', description: 'User ID associated with this event type' })
  @IsString()
  @IsOptional()
  user_id?: string;
}

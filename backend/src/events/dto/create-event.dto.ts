import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  Matches,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    example: 'My Birthday Bash',
    description: 'Name of the event',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Celebrating my 25th birthday',
    description: 'Description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'user-uuid', description: 'User ID owner' })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({ example: '2026-07-11T18:00:00Z', description: 'Start Date' })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({ example: '2026-07-11T23:59:59Z', description: 'End Date' })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @ApiProperty({ example: '2026-07-11', description: 'Event Date' })
  @IsDateString()
  @IsNotEmpty()
  event_date: string;

  @ApiPropertyOptional({
    example: 'https://example.com/event',
    description: 'Event URL',
  })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({ example: 'event-type-uuid', description: 'Event Type ID' })
  @IsString()
  @IsNotEmpty()
  event_type_id: string;

  @ApiProperty({
    example: 'my_birthday_bash_2026',
    description: 'Unique slug (alphabets, numbers, underscore only)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'slug can only contain alphabets, numbers, and underscores',
  })
  slug: string;
}

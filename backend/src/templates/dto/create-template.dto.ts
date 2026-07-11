import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';
import { TemplateStatus } from '../../../generated/prisma';

export class CreateTemplateDto {
  @ApiProperty({ example: 'event-type-uuid', description: 'Event Type ID' })
  @IsString()
  @IsNotEmpty()
  event_type_id: string;

  @ApiProperty({
    example: 'Golden Confetti Theme',
    description: 'Name of the template',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'golden-confetti-theme', description: 'Unique slug' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'GCT', description: 'Unique alpha code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 49.99, description: 'Price of the template' })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiPropertyOptional({ example: 99.99, description: 'Strikethrough price' })
  @IsNumber()
  @IsOptional()
  strikethrough_price?: number;

  @ApiPropertyOptional({
    example: 'https://images.unsplash.com/...',
    description: 'Preview image URL',
  })
  @IsString()
  @IsOptional()
  preview_image?: string;

  @ApiPropertyOptional({
    example: 'wedding-template',
    description: 'Identifier / key for the template view page component',
  })
  @IsString()
  @IsOptional()
  view_page?: string;

  @ApiProperty({
    enum: TemplateStatus,
    default: TemplateStatus.draft,
    description: 'Status',
  })
  @IsEnum(TemplateStatus)
  @IsOptional()
  status?: TemplateStatus;

  @ApiPropertyOptional({
    example: ['field-uuid-1', 'field-uuid-2'],
    description: 'Associated field IDs',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  field_ids?: string[];
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { FieldType } from '../../../generated/prisma';

export class CreateFieldDto {
  @ApiProperty({
    example: 'event_title',
    description: 'Unique identifier for the field',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({
    enum: FieldType,
    default: FieldType.text,
    description: 'Type of the field',
  })
  @IsEnum(FieldType)
  @IsNotEmpty()
  type: FieldType;

  @ApiPropertyOptional({
    example: 'template-uuid',
    description: 'Optional Template ID that this field belongs to',
  })
  @IsString()
  @IsOptional()
  template_id?: string;
}

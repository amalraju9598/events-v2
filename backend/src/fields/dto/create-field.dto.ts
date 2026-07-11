import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
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
}

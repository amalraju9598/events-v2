import { UserType } from '../../../generated/prisma';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'The unique email of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Mobile number of the user',
  })
  @IsString()
  @IsOptional()
  mobile?: string;

  @ApiProperty({
    example: 'password123',
    minLength: 8,
    description: 'The password of the user',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    example: 'johndoe',
    description: 'The unique username of the user',
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    enum: UserType,
    default: UserType.user,
    description: 'The type of user role',
  })
  @IsEnum(UserType)
  @IsOptional()
  user_type?: UserType;
}

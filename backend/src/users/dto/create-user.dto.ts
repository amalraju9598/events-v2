import { UserType } from '../../../generated/prisma';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  mobile?: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsEnum(UserType)
  @IsOptional()
  user_type?: UserType;
}

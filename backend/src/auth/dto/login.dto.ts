import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'superadmin@example.com',
    description: 'The email of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'SuperAdminPassword123!',
    minLength: 8,
    description: 'The password of the user',
  })
  @IsString()
  @MinLength(8)
  password: string;
}

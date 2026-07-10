import { Controller, Post, Get, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login a user and retrieve a JWT token' })
  @ApiResponse({ status: 200, description: 'Login successful, returns the JWT access token.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Log out user' })
  @ApiResponse({ status: 200, description: 'Log out successful.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async logout() {
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile details' })
  @ApiResponse({ status: 200, description: 'Returns the user details along with roles and permissions.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async me(@Req() req) {
    return req.user;
  }
}

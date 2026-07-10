import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, email, mobile, username } = createUserDto;

    // Check uniqueness
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(mobile ? [{ mobile }] : []),
          ...(username ? [{ username }] : []),
        ],
      },
    });

    if (existing) {
      throw new ConflictException(
        'A user with this email, mobile, or username already exists.',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        username: true,
        user_type: true,
        email_verified_at: true,
        phone_verified_at: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        username: true,
        user_type: true,
        email_verified_at: true,
        phone_verified_at: true,
        created_at: true,
        updated_at: true,
        user_roles: {
          include: { role: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        username: true,
        user_type: true,
        email_verified_at: true,
        phone_verified_at: true,
        created_at: true,
        updated_at: true,
        user_roles: {
          include: {
            role: {
              include: { role_permissions: { include: { permission: true } } },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id); // Ensure exists

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        username: true,
        user_type: true,
        updated_at: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure exists
    await this.prisma.user.delete({ where: { id } });
    return { message: `User #${id} deleted successfully` };
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';

@Injectable()
export class FieldsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFieldDto: CreateFieldDto) {
    const { identifier } = createFieldDto;

    // Check if unique identifier is violated
    const existing = await this.prisma.field.findUnique({
      where: { identifier },
    });
    if (existing) {
      throw new ConflictException(
        `A field with identifier "${identifier}" already exists.`,
      );
    }

    return this.prisma.field.create({
      data: createFieldDto,
    });
  }

  async findAll(page?: number, limit?: number, search?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
        { identifier: { contains: search } },
        { type: { contains: search } },
      ];
    }

    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit ? limit : undefined;

    const [data, total] = await Promise.all([
      this.prisma.field.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.field.count({ where }),
    ]);

    return {
      data,
      total,
      page: page || 1,
      limit: limit || total,
    };
  }

  async findOne(id: string) {
    const field = await this.prisma.field.findUnique({
      where: { id },
    });

    if (!field) {
      throw new NotFoundException(`Field #${id} not found`);
    }

    return field;
  }

  async update(id: string, updateFieldDto: UpdateFieldDto) {
    const current = await this.findOne(id);

    if (
      updateFieldDto.identifier &&
      updateFieldDto.identifier !== current.identifier
    ) {
      const existing = await this.prisma.field.findUnique({
        where: { identifier: updateFieldDto.identifier },
      });
      if (existing) {
        throw new ConflictException(
          `A field with identifier "${updateFieldDto.identifier}" already exists.`,
        );
      }
    }

    return this.prisma.field.update({
      where: { id },
      data: updateFieldDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.field.delete({ where: { id } });
    return { message: `Field #${id} deleted successfully` };
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventTypeDto } from './dto/create-event-type.dto';
import { UpdateEventTypeDto } from './dto/update-event-type.dto';

@Injectable()
export class EventTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEventTypeDto: CreateEventTypeDto) {
    const { identifier, user_id } = createEventTypeDto;

    // Check if unique constraint is violated
    const existing = await this.prisma.eventType.findFirst({
      where: {
        identifier,
        user_id: user_id || null,
      },
    });

    if (existing) {
      throw new ConflictException(
        `An event type with identifier "${identifier}" already exists for this user.`,
      );
    }

    return this.prisma.eventType.create({
      data: createEventTypeDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(page?: number, limit?: number, search?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { identifier: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (page !== undefined && limit !== undefined) {
      const skip = (page - 1) * limit;
      const take = limit;

      const [data, total] = await Promise.all([
        this.prisma.eventType.findMany({
          where,
          skip,
          take,
          orderBy: { created_at: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        this.prisma.eventType.count({ where }),
      ]);

      return {
        data,
        total,
        page,
        limit,
      };
    }

    const data = await this.prisma.eventType.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      data,
      total: data.length,
      page: 1,
      limit: data.length,
    };
  }

  async findOne(id: string) {
    const eventType = await this.prisma.eventType.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!eventType) {
      throw new NotFoundException(`Event Type #${id} not found`);
    }

    return eventType;
  }

  async update(id: string, updateEventTypeDto: UpdateEventTypeDto) {
    const current = await this.findOne(id);

    const identifier = updateEventTypeDto.identifier ?? current.identifier;
    const user_id = updateEventTypeDto.user_id !== undefined ? updateEventTypeDto.user_id : current.user_id;

    // Check if the update violates unique constraint
    if (identifier !== current.identifier || user_id !== current.user_id) {
      const existing = await this.prisma.eventType.findFirst({
        where: {
          identifier,
          user_id: user_id || null,
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `An event type with identifier "${identifier}" already exists for this user.`,
        );
      }
    }

    return this.prisma.eventType.update({
      where: { id },
      data: updateEventTypeDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.eventType.delete({ where: { id } });
    return { message: `Event Type #${id} deleted successfully` };
  }
}

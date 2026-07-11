import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto) {
    const { slug, start_date, end_date, event_date, ...rest } = createEventDto;

    // Check slug uniqueness
    const existing = await this.prisma.event.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException(`Event with slug "${slug}" already exists.`);
    }

    return this.prisma.event.create({
      data: {
        ...rest,
        slug,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        event_date: new Date(event_date),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_pic: true,
          },
        },
        event_type: true,
      },
    });
  }

  async findAll(
    page?: number,
    limit?: number,
    search?: string,
    userId?: string,
  ) {
    const where: any = {};

    if (userId) {
      where.user_id = userId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit ? limit : undefined;

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
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
              profile_pic: true,
            },
          },
          event_type: true,
          event_templates: {
            include: {
              template: true,
            },
          },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data,
      total,
      page: page || 1,
      limit: limit || total,
    };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_pic: true,
          },
        },
        event_type: true,
        event_templates: {
          include: {
            template: {
              include: {
                template_fields: {
                  include: {
                    field: true,
                  },
                },
              },
            },
            event_template_fields: {
              include: {
                field: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event #${id} not found`);
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const current = await this.findOne(id);

    if (updateEventDto.user_id && updateEventDto.user_id !== current.user_id) {
      throw new BadRequestException(
        'User cannot be changed after the event is created',
      );
    }

    if (updateEventDto.slug && updateEventDto.slug !== current.slug) {
      const existing = await this.prisma.event.findUnique({
        where: { slug: updateEventDto.slug },
      });
      if (existing) {
        throw new ConflictException(
          `Event with slug "${updateEventDto.slug}" already exists.`,
        );
      }
    }

    const data: any = { ...updateEventDto };
    if (updateEventDto.start_date)
      data.start_date = new Date(updateEventDto.start_date);
    if (updateEventDto.end_date)
      data.end_date = new Date(updateEventDto.end_date);
    if (updateEventDto.event_date)
      data.event_date = new Date(updateEventDto.event_date);

    return this.prisma.event.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_pic: true,
          },
        },
        event_type: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.event.delete({ where: { id } });
    return { message: `Event #${id} deleted successfully` };
  }

  // --- Event Template operations ---

  async addTemplateToEvent(eventId: string, templateId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException(`Event #${eventId} not found`);

    const template = await this.prisma.template.findUnique({
      where: { id: templateId },
    });
    if (!template)
      throw new NotFoundException(`Template #${templateId} not found`);

    if (template.event_type_id !== event.event_type_id) {
      throw new BadRequestException(
        'Template event type must match event event type',
      );
    }

    const existing = await this.prisma.eventTemplate.findFirst({
      where: { event_id: eventId, template_id: templateId },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.eventTemplate.create({
      data: {
        event_id: eventId,
        template_id: templateId,
        is_enabled: false,
      },
      include: {
        template: true,
      },
    });
  }

  async enableEventTemplate(eventTemplateId: string) {
    const eventTemplate = await this.prisma.eventTemplate.findUnique({
      where: { id: eventTemplateId },
    });
    if (!eventTemplate) {
      throw new NotFoundException(
        `Event Template association #${eventTemplateId} not found`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Disable all templates for this event
      await tx.eventTemplate.updateMany({
        where: { event_id: eventTemplate.event_id },
        data: { is_enabled: false },
      });

      // Enable the target template
      return tx.eventTemplate.update({
        where: { id: eventTemplateId },
        data: { is_enabled: true },
        include: {
          template: true,
        },
      });
    });
  }

  async disableEventTemplate(eventTemplateId: string) {
    const eventTemplate = await this.prisma.eventTemplate.findUnique({
      where: { id: eventTemplateId },
    });
    if (!eventTemplate) {
      throw new NotFoundException(
        `Event Template association #${eventTemplateId} not found`,
      );
    }

    return this.prisma.eventTemplate.update({
      where: { id: eventTemplateId },
      data: { is_enabled: false },
      include: {
        template: true,
      },
    });
  }

  async saveTemplateFieldValues(
    eventTemplateId: string,
    fields: { field_id: string; value: string }[],
  ) {
    const eventTemplate = await this.prisma.eventTemplate.findUnique({
      where: { id: eventTemplateId },
    });
    if (!eventTemplate) {
      throw new NotFoundException(
        `Event Template association #${eventTemplateId} not found`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Delete existing field entries
      await tx.eventTemplateField.deleteMany({
        where: { event_template_id: eventTemplateId },
      });

      // Insert new field values
      if (fields.length > 0) {
        await tx.eventTemplateField.createMany({
          data: fields.map((f) => ({
            event_template_id: eventTemplateId,
            field_id: f.field_id,
            value: f.value,
          })),
        });
      }

      return tx.eventTemplate.findUnique({
        where: { id: eventTemplateId },
        include: {
          template: true,
          event_template_fields: {
            include: {
              field: true,
            },
          },
        },
      });
    });
  }
}

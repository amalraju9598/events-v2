import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTemplateDto: CreateTemplateDto) {
    const { field_ids, ...templateData } = createTemplateDto;

    // Check slug and code uniqueness
    const existingSlug = await this.prisma.template.findUnique({
      where: { slug: templateData.slug },
    });
    if (existingSlug) {
      throw new ConflictException(
        `Template with slug "${templateData.slug}" already exists.`,
      );
    }
    const existingCode = await this.prisma.template.findUnique({
      where: { code: templateData.code },
    });
    if (existingCode) {
      throw new ConflictException(
        `Template with code "${templateData.code}" already exists.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const template = await tx.template.create({
        data: {
          ...templateData,
          template_fields:
            field_ids && field_ids.length > 0
              ? {
                  create: field_ids.map((field_id) => ({
                    field: { connect: { id: field_id } },
                  })),
                }
              : undefined,
        },
        include: {
          event_type: true,
          template_fields: {
            include: {
              field: true,
            },
          },
        },
      });
      return template;
    });
  }

  async findAll(page?: number, limit?: number, search?: string, eventTypeId?: string) {
    const where: any = {};

    if (eventTypeId) {
      where.event_type_id = eventTypeId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { code: { contains: search } },
      ];
    }

    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit ? limit : undefined;

    const [data, total] = await Promise.all([
      this.prisma.template.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
        include: {
          event_type: true,
          template_fields: {
            include: {
              field: true,
            },
          },
        },
      }),
      this.prisma.template.count({ where }),
    ]);

    return {
      data,
      total,
      page: page || 1,
      limit: limit || total,
    };
  }

  async findOne(id: string) {
    const template = await this.prisma.template.findUnique({
      where: { id },
      include: {
        event_type: true,
        template_fields: {
          include: {
            field: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`Template #${id} not found`);
    }

    return template;
  }

  async update(id: string, updateTemplateDto: UpdateTemplateDto) {
    const { field_ids, ...templateData } = updateTemplateDto;

    // Verify template exists
    const current = await this.findOne(id);

    // Check unique constraints if updated
    if (templateData.slug && templateData.slug !== current.slug) {
      const existingSlug = await this.prisma.template.findUnique({
        where: { slug: templateData.slug },
      });
      if (existingSlug) {
        throw new ConflictException(
          `Template with slug "${templateData.slug}" already exists.`,
        );
      }
    }
    if (templateData.code && templateData.code !== current.code) {
      const existingCode = await this.prisma.template.findUnique({
        where: { code: templateData.code },
      });
      if (existingCode) {
        throw new ConflictException(
          `Template with code "${templateData.code}" already exists.`,
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      if (field_ids !== undefined) {
        // Clear existing associations
        await tx.templateField.deleteMany({
          where: { template_id: id },
        });

        // Add new associations
        if (field_ids.length > 0) {
          await tx.templateField.createMany({
            data: field_ids.map((field_id) => ({
              template_id: id,
              field_id,
            })),
          });
        }
      }

      return tx.template.update({
        where: { id },
        data: templateData,
        include: {
          event_type: true,
          template_fields: {
            include: {
              field: true,
            },
          },
        },
      });
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.template.delete({ where: { id } });
    return { message: `Template #${id} deleted successfully` };
  }

  // Fields and Event Types helpers for frontend selection
  async findAllFields() {
    return this.prisma.field.findMany({
      orderBy: { identifier: 'asc' },
    });
  }
}

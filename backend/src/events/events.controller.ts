import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Put,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('events')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all events (optional user_id and search filters)',
  })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('user_id') userId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.eventsService.findAll(pageNum, limitNum, search, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an event by ID' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event' })
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event' })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  // --- Event Template Routes ---

  @Post(':id/templates')
  @ApiOperation({ summary: 'Add a template association to an event' })
  addTemplate(
    @Param('id') id: string,
    @Body('template_id') templateId: string,
  ) {
    return this.eventsService.addTemplateToEvent(id, templateId);
  }

  @Patch('templates/:eventTemplateId/enable')
  @ApiOperation({
    summary: 'Enable an event template and disable all others for the event',
  })
  enableTemplate(@Param('eventTemplateId') eventTemplateId: string) {
    return this.eventsService.enableEventTemplate(eventTemplateId);
  }

  @Patch('templates/:eventTemplateId/disable')
  @ApiOperation({ summary: 'Disable an event template' })
  disableTemplate(@Param('eventTemplateId') eventTemplateId: string) {
    return this.eventsService.disableEventTemplate(eventTemplateId);
  }

  @Put('templates/:eventTemplateId/fields')
  @ApiOperation({ summary: 'Save template field values for an event template' })
  saveFields(
    @Param('eventTemplateId') eventTemplateId: string,
    @Body('fields') fields: { field_id: string; value: string }[],
  ) {
    return this.eventsService.saveTemplateFieldValues(
      eventTemplateId,
      fields || [],
    );
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventTypesService } from './event-types.service';
import { CreateEventTypeDto } from './dto/create-event-type.dto';
import { UpdateEventTypeDto } from './dto/update-event-type.dto';

@ApiTags('Event Types')
@Controller('event-types')
export class EventTypesController {
  constructor(private readonly eventTypesService: EventTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event type' })
  @ApiResponse({ status: 201, description: 'Event type successfully created.' })
  @ApiResponse({ status: 409, description: 'Event type identifier + user_id already exists.' })
  create(@Body() createEventTypeDto: CreateEventTypeDto) {
    return this.eventTypesService.create(createEventTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all event types with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Paginated list of event types.' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.eventTypesService.findAll(pageNum, limitNum, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific event type by ID' })
  @ApiResponse({ status: 200, description: 'Event type found.' })
  @ApiResponse({ status: 404, description: 'Event type not found.' })
  findOne(@Param('id') id: string) {
    return this.eventTypesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event type' })
  @ApiResponse({ status: 200, description: 'Event type successfully updated.' })
  @ApiResponse({ status: 404, description: 'Event type not found.' })
  update(
    @Param('id') id: string,
    @Body() updateEventTypeDto: UpdateEventTypeDto,
  ) {
    return this.eventTypesService.update(id, updateEventTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event type' })
  @ApiResponse({ status: 200, description: 'Event type successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Event type not found.' })
  remove(@Param('id') id: string) {
    return this.eventTypesService.remove(id);
  }
}

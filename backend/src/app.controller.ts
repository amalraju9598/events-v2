import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { EventsService } from './events/events.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import * as crypto from 'crypto';

function encrypt(text: string): string {
  const keyString =
    process.env.RESPONSE_ENCRYPTION_KEY ||
    'my-secure-fallback-encryption-key-32-chars!';
  const key = crypto.createHash('sha256').update(keyString).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

@ApiTags('public-events')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly eventsService: EventsService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('events/public/:slug')
  @ApiOperation({ summary: 'Get public event details by slug' })
  async findPublicEvent(@Param('slug') slug: string) {
    const event = await this.eventsService.findOneBySlug(slug);
    if (!event) {
      return null;
    }
    const encrypted = encrypt(JSON.stringify(event));
    return { data: encrypted };
  }
}

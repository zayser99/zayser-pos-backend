import { Controller, Get, Post, Body, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpsertSettingDto } from './dto/upsert-setting.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @UseGuards(AuthGuard)
  upsert(@Body() upsertSettingDto: UpsertSettingDto) {
    return this.settingsService.upsert(upsertSettingDto);
  }

  @Get('public/:key')
  findByKeyPublic(@Param('key') key: string) {
    const ALLOWED_PUBLIC_KEYS = ['company_data'];
    if (!ALLOWED_PUBLIC_KEYS.includes(key)) {
      throw new ForbiddenException(`Access to setting '${key}' is not allowed publicly.`);
    }
    return this.settingsService.findByKey(key);
  }

  @Get(':key')
  @UseGuards(AuthGuard)
  findByKey(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }
}

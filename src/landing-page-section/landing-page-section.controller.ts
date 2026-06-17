import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { LandingPageSectionService } from './landing-page-section.service';
import { UpsertLandingPageSectionDto } from './dto/upsert-landing-page-section.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('landing-page-section')
export class LandingPageSectionController {
  constructor(private readonly landingPageSectionService: LandingPageSectionService) {}

  @Post()
  @UseGuards(AuthGuard)
  upsert(@Body() upsertLandingPageSectionDto: UpsertLandingPageSectionDto) {
    return this.landingPageSectionService.upsert(upsertLandingPageSectionDto);
  }

  @Get(':key')
  @UseGuards(AuthGuard) // Protect full admin read
  findByKey(@Param('key') key: string) {
    return this.landingPageSectionService.findByKey(key);
  }

  @Get('public/content/:key')
  findContentByKey(@Param('key') key: string) {
    return this.landingPageSectionService.findContentByKey(key);
  }
}

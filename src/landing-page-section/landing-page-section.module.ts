import { Module } from '@nestjs/common';
import { LandingPageSectionController } from './landing-page-section.controller';
import { LandingPageSectionService } from './landing-page-section.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [LandingPageSectionController],
  providers: [LandingPageSectionService]
})
export class LandingPageSectionModule {}

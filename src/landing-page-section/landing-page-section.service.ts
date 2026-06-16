import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertLandingPageSectionDto } from './dto/upsert-landing-page-section.dto';

@Injectable()
export class LandingPageSectionService {
  constructor(private prisma: PrismaService) {}

  async upsert(dto: UpsertLandingPageSectionDto) {
    const data: any = {
      description: dto.description,
    };
    
    if (dto.content !== undefined) {
      data.content = dto.content;
    }

    return this.prisma.landingPageSection.upsert({
      where: { key: dto.key },
      update: data,
      create: {
        key: dto.key,
        ...data,
      },
    });
  }

  async findByKey(key: string) {
    const section = await this.prisma.landingPageSection.findUnique({
      where: { key },
    });

    if (!section) {
      throw new NotFoundException(`Landing page section with key ${key} not found`);
    }

    return section;
  }
}


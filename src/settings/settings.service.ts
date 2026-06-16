import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertSettingDto } from './dto/upsert-setting.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async upsert(dto: UpsertSettingDto) {
    const data: any = {
      value: dto.value,
      description: dto.description,
      isActive: dto.isActive,
    };
    
    if (dto.metadata !== undefined) {
      data.metadata = dto.metadata;
    }

    return this.prisma.settings.upsert({
      where: { key: dto.key },
      update: data,
      create: {
        key: dto.key,
        ...data,
      },
    });
  }

  async findByKey(key: string) {
    const setting = await this.prisma.settings.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key ${key} not found`);
    }

    return setting;
  }
}

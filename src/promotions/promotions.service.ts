import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path if needed
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPromotionDto: CreatePromotionDto) {
    const { productIds, ...data } = createPromotionDto;
    return this.prisma.promotion.create({
      data: {
        ...data,
        products: productIds?.length ? {
          connect: productIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        products: true,
      }
    });
  }

  async findAll() {
    return this.prisma.promotion.findMany({
      include: {
        products: true,
      }
    });
  }

  async findActive() {
    return this.prisma.promotion.findMany({
      where: {
        isActive: true,
      },
      include: {
        products: true,
      }
    });
  }

  async findOne(id: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: {
        products: true,
      }
    });
    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    return promotion;
  }

  async update(id: string, updatePromotionDto: UpdatePromotionDto) {
    const { productIds, ...data } = updatePromotionDto;
    
    // Si se envían productIds, reemplazamos la relación
    const productsUpdate = productIds ? {
      set: productIds.map(pid => ({ id: pid }))
    } : undefined;

    return this.prisma.promotion.update({
      where: { id },
      data: {
        ...data,
        ...(productsUpdate && { products: productsUpdate })
      },
      include: {
        products: true,
      }
    });
  }

  async remove(id: string) {
    return this.prisma.promotion.delete({
      where: { id },
    });
  }
}

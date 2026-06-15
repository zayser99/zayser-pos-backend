import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(createProductDto: CreateProductDto) {
    // Generar un slug básico
    const slug = createProductDto.name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    // Generar un sufijo aleatorio para evitar colisiones de slugs si existen repetidos
    const finalSlug = `${slug}-${Math.floor(Math.random() * 1000)}`;

    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        slug: finalSlug,
        sku: createProductDto.sku,
        category: createProductDto.categoryId, // Guardamos el ID en el campo category
        sellPrice: createProductDto.price,     // Mapeamos price a sellPrice
        buyPrice: 0,                           // Valor por defecto temporal para buyPrice
        stock: createProductDto.stock,
        status: createProductDto.status,
        description: createProductDto.description,
      },
    });
  }

  async createCategory(createProductCategoryDto: CreateProductCategoryDto) {
    const slug = createProductCategoryDto.name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    const finalSlug = `${slug}-${Math.floor(Math.random() * 1000)}`;

    return this.prisma.productCategory.create({
      data: {
        name: createProductCategoryDto.name,
        slug: finalSlug,
        description: createProductCategoryDto.description,
      },
    });
  }

  async getCategoriesSelect() {
    const categories = await this.prisma.productCategory.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    }));
  }
}


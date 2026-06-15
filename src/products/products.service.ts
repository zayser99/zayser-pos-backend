import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getProducts(query: GetProductsDto) {
    const { page = 1, limit = 10, search, categoryId, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.category = categoryId;
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createProduct(createProductDto: CreateProductDto, coverImageFile?: Express.Multer.File) {
    // Generar un slug básico
    const slug = createProductDto.name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    const finalSlug = `${slug}-${Math.floor(Math.random() * 1000)}`;

    let coverImageUrl = null;
    if (coverImageFile) {
      const uploadResult = await this.cloudinaryService.uploadFile(coverImageFile);
      coverImageUrl = uploadResult.secure_url;
    }

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
        coverImage: coverImageUrl,
      },
    });
  }

  async createCategory(createProductCategoryDto: CreateProductCategoryDto, coverImageFile?: Express.Multer.File) {
    const slug = createProductCategoryDto.name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    const finalSlug = `${slug}-${Math.floor(Math.random() * 1000)}`;

    let coverImageUrl = null;
    if (coverImageFile) {
      const uploadResult = await this.cloudinaryService.uploadFile(coverImageFile);
      coverImageUrl = uploadResult.secure_url;
    }

    return this.prisma.productCategory.create({
      data: {
        name: createProductCategoryDto.name,
        slug: finalSlug,
        description: createProductCategoryDto.description,
        coverImage: coverImageUrl,
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

  async deleteProduct(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.coverImage) {
      const publicId = this.cloudinaryService.extractPublicId(product.coverImage);
      if (publicId) {
        await this.cloudinaryService.deleteFile(publicId);
      }
    }

    return this.prisma.product.delete({ where: { id } });
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto, coverImageFile?: Express.Multer.File) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new Error('Product not found');
    }

    let newCoverImageUrl = product.coverImage;
    if (coverImageFile) {
      // Si ya tenia imagen, la borramos
      if (product.coverImage) {
        const publicId = this.cloudinaryService.extractPublicId(product.coverImage);
        if (publicId) {
          try {
            await this.cloudinaryService.deleteFile(publicId);
          } catch (e) {
            console.error('Failed to delete old image from Cloudinary', e);
          }
        }
      }

      // Subimos la nueva
      const uploadResult = await this.cloudinaryService.uploadFile(coverImageFile);
      newCoverImageUrl = uploadResult.secure_url;
    }

    const dataToUpdate: Prisma.ProductUpdateInput = {};
    if (updateProductDto.name !== undefined) dataToUpdate.name = updateProductDto.name;
    if (updateProductDto.sku !== undefined) dataToUpdate.sku = updateProductDto.sku;
    if (updateProductDto.categoryId !== undefined) dataToUpdate.category = updateProductDto.categoryId;
    if (updateProductDto.price !== undefined) dataToUpdate.sellPrice = updateProductDto.price;
    if (updateProductDto.stock !== undefined) dataToUpdate.stock = updateProductDto.stock;
    if (updateProductDto.status !== undefined) dataToUpdate.status = updateProductDto.status;
    if (updateProductDto.description !== undefined) dataToUpdate.description = updateProductDto.description;
    
    if (coverImageFile) {
       dataToUpdate.coverImage = newCoverImageUrl;
    }

    return this.prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });
  }
}


import { Controller, Post, Get, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('coverImage'))
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() coverImage?: Express.Multer.File,
  ) {
    // Aquí el coverImage está disponible como archivo binario para el futuro (ej. Cloudinary)
    return this.productsService.createProduct(createProductDto);
  }

  @Post('categories')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('coverImage'))
  createCategory(
    @Body() createCategoryDto: CreateProductCategoryDto,
    @UploadedFile() coverImage?: Express.Multer.File,
  ) {
    // Aquí el coverImage está disponible
    return this.productsService.createCategory(createCategoryDto);
  }

  @Get('categories/select')
  @UseGuards(AuthGuard)
  getCategoriesSelect() {
    return this.productsService.getCategoriesSelect();
  }
}


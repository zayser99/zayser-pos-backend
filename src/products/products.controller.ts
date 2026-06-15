import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard)
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Post('categories')
  @UseGuards(AuthGuard)
  createCategory(@Body() createCategoryDto: CreateProductCategoryDto) {
    return this.productsService.createCategory(createCategoryDto);
  }

  @Get('categories/select')
  @UseGuards(AuthGuard)
  getCategoriesSelect() {
    return this.productsService.getCategoriesSelect();
  }
}


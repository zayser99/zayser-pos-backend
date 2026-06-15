import { Controller, Post, Get, Delete, Param, Body, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @UseGuards(AuthGuard)
  getProducts(@Query() query: GetProductsDto) {
    return this.productsService.getProducts(query);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('coverImage'))
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() coverImage?: Express.Multer.File,
  ) {
    return this.productsService.createProduct(createProductDto, coverImage);
  }

  @Post('categories')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('coverImage'))
  createCategory(
    @Body() createCategoryDto: CreateProductCategoryDto,
    @UploadedFile() coverImage?: Express.Multer.File,
  ) {
    return this.productsService.createCategory(createCategoryDto, coverImage);
  }

  @Get('categories/select')
  @UseGuards(AuthGuard)
  getCategoriesSelect() {
    return this.productsService.getCategoriesSelect();
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }
}


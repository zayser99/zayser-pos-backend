import { Controller, Post, Get, Delete, Patch, Param, Body, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { SettingsService } from '../settings/settings.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly settingsService: SettingsService
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  getProducts(@Query() query: GetProductsDto) {
    return this.productsService.getProducts(query);
  }

  @Get('public')
  async getPublicProducts(@Query() query: GetProductsDto) {
    // Force active status for public endpoints
    query.status = 'ACTIVE';
    const result = await this.productsService.getProducts(query);
    
    // Strip prices if settings say so
    const settings = await this.settingsService.findByKey('company_data').catch(() => null);
    if (settings?.metadata?.showProductPrices === false) {
      result.data.forEach(p => {
        p.sellPrice = 0;
      });
    }
    
    return result;
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

  @Get('categories/public')
  getPublicCategories() {
    return this.productsService.getCategoriesSelect();
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('coverImage'))
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() coverImage?: Express.Multer.File,
  ) {
    return this.productsService.updateProduct(id, updateProductDto, coverImage);
  }
}


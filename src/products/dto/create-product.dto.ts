import { IsString, IsNumber, IsEnum, IsOptional, Min, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  @Length(2, 255)
  name: string;

  @IsString()
  @Length(3, 255)
  sku: string;

  @IsString()
  categoryId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  price: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number;

  @IsEnum(['ACTIVE', 'INACTIVE'])
  status: 'ACTIVE' | 'INACTIVE';

  @IsString()
  @IsOptional()
  description?: string;
  
  // NOTE: coverImage will be handled via Multipart/form-data upload middleware and validation pipe in controller.
}

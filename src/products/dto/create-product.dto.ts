import { IsString, IsNumber, IsEnum, IsOptional, Min, Length } from 'class-validator';
import { ProductStatus } from '@prisma/client'; // Assuming Prisma generated the enum, if not, we can define it. Wait, Prisma generated it.

export class CreateProductDto {
  @IsString()
  @Length(2, 255)
  name: string;

  @IsString()
  @Length(3, 255)
  sku: string;

  @IsString()
  categoryId: string;

  @IsNumber()
  @Min(0.01)
  price: number;

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

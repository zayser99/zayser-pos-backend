import { IsString, IsOptional, Length } from 'class-validator';

export class CreateProductCategoryDto {
  @IsString()
  @Length(2, 255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
  
  // NOTE: coverImage will be handled via Multipart/form-data upload middleware and validation pipe in controller.
}

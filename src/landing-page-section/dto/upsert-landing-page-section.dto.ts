import { IsString, IsOptional } from 'class-validator';

export class UpsertLandingPageSectionDto {
  @IsString()
  key: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  content?: any;
}

import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpsertSettingDto {
  @IsString()
  key: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  metadata?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

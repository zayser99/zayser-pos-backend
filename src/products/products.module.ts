import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [AuthModule, CloudinaryModule, SettingsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}

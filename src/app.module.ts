import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ProductsModule } from './products/products.module';
import { SettingsModule } from './settings/settings.module';
import { LandingPageSectionModule } from './landing-page-section/landing-page-section.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que ConfigService esté disponible globalmente sin importarlo de nuevo
    }),
    PrismaModule,
    AuthModule,
    CloudinaryModule,
    ProductsModule,
    SettingsModule,
    LandingPageSectionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

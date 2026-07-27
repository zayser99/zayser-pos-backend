import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get('setup-status')
  async getSetupStatus() {
    const count = await this.prisma.user.count();
    return { hasUsers: count > 0 };
  }

  @Get('fix-admin')
  async fixAdmin() {
    await this.prisma.user.updateMany({
      where: { role: 'superadmin' },
      data: { role: 'admin' },
    });
    return { status: 'fixed' };
  }
}

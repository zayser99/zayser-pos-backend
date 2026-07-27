import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('No tienes permisos suficientes');
    }

    // Admin role bypasses all permission checks
    if (user.role === 'admin') {
      return true;
    }

    // Fetch the role's permissions
    const appRole = await this.prisma.appRole.findUnique({
      where: { name: user.role }
    });

    if (!appRole) {
      throw new ForbiddenException('Rol no encontrado');
    }

    if (appRole.permissions.includes('*')) {
      return true;
    }

    const hasPermission = requiredPermissions.every(permission => 
      appRole.permissions.includes(permission)
    );

    if (!hasPermission) {
      throw new ForbiddenException('No tienes permisos suficientes para realizar esta acción');
    }

    return true;
  }
}

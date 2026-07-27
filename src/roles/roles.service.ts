import { Injectable, NotFoundException, ConflictException, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService implements OnModuleInit {
  private readonly logger = new Logger(RolesService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultRoles();
  }

  private async seedDefaultRoles() {
    try {
      // Seed Admin Role
      const adminRole = await this.prisma.appRole.findUnique({ where: { name: 'admin' } });
      if (!adminRole) {
        await this.prisma.appRole.create({
          data: {
            name: 'admin',
            description: 'Administrador Principal (Acceso Total)',
            permissions: ['*'], // * means all
          }
        });
        this.logger.log('Rol "admin" creado por defecto.');
      }

      // Seed User Role
      const userRole = await this.prisma.appRole.findUnique({ where: { name: 'user' } });
      if (!userRole) {
        await this.prisma.appRole.create({
          data: {
            name: 'user',
            description: 'Usuario Regular (Vendedor/Cajero)',
            permissions: [], // By default, no access to admin modules unless specified
          }
        });
        this.logger.log('Rol "user" creado por defecto.');
      }
    } catch (e) {
      this.logger.error('Error poblando roles por defecto', e);
    }
  }

  async create(createRoleDto: CreateRoleDto) {
    const existing = await this.prisma.appRole.findUnique({
      where: { name: createRoleDto.name.toLowerCase() }
    });
    if (existing) {
      throw new ConflictException('Ya existe un rol con ese nombre');
    }
    
    return this.prisma.appRole.create({
      data: {
        name: createRoleDto.name.toLowerCase(),
        description: createRoleDto.description,
        permissions: createRoleDto.permissions,
      }
    });
  }

  async findAll() {
    return this.prisma.appRole.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.appRole.findUnique({
      where: { id }
    });
    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }
    return role;
  }

  async findByName(name: string) {
    const role = await this.prisma.appRole.findUnique({
      where: { name: name.toLowerCase() }
    });
    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.findOne(id);
    
    // Prevent modifying admin role
    if (role.name === 'admin') {
      throw new ConflictException('El rol admin no puede ser modificado');
    }

    if (updateRoleDto.name && updateRoleDto.name.toLowerCase() !== role.name) {
      const existing = await this.prisma.appRole.findUnique({
        where: { name: updateRoleDto.name.toLowerCase() }
      });
      if (existing) {
        throw new ConflictException('Ya existe un rol con ese nombre');
      }
    }

    return this.prisma.appRole.update({
      where: { id },
      data: {
        name: updateRoleDto.name ? updateRoleDto.name.toLowerCase() : undefined,
        description: updateRoleDto.description,
        permissions: updateRoleDto.permissions,
      }
    });
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    
    if (role.name === 'admin' || role.name === 'user') {
      throw new ConflictException('Los roles por defecto no pueden ser eliminados');
    }

    // Check if any users have this role
    const usersWithRole = await this.prisma.user.count({
      where: { role: role.name }
    });
    if (usersWithRole > 0) {
      throw new ConflictException(`No se puede eliminar: hay ${usersWithRole} usuarios usando este rol`);
    }

    return this.prisma.appRole.delete({
      where: { id }
    });
  }
}

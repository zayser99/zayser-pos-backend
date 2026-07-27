import { Injectable, Logger } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  public readonly auth;
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {
    this.auth = betterAuth({
      baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
      trustedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      database: prismaAdapter(this.prisma, {
        provider: 'postgresql',
      }),
      emailAndPassword: {
        enabled: true,
      },
      plugins: [
        admin()
      ],
      databaseHooks: {
        user: {
          create: {
            before: async (user) => {
              const count = await this.prisma.user.count();
              if (count === 0) {
                this.logger.log(`Configurando primer usuario como superadmin: ${user.email}`);
                return {
                  data: {
                    ...user,
                    role: 'superadmin',
                  }
                };
              }
              // Si no tiene rol especificado y no es el primero, por defecto es admin (o el que se le pase)
              return {
                data: {
                  ...user,
                  role: user.role || 'admin',
                }
              };
            }
          }
        }
      },
      onRequest: async (req, ctx) => {
        // Bloquear registro público (sign-up) si ya hay usuarios.
        // La creación desde el panel usará /admin/user/create (API del plugin) en su lugar.
        if (ctx.path.startsWith('/sign-up')) {
          const count = await this.prisma.user.count();
          if (count > 0) {
            this.logger.warn(`Intento de registro público denegado desde IP: ${req.headers.get('x-forwarded-for') || 'desconocida'}`);
            throw new Error("El registro público está desactivado. Usa el panel de administración.");
          }
        }
      }
    });
  }
}

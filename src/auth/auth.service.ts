import { Injectable } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  public readonly auth;

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
    });
  }
}

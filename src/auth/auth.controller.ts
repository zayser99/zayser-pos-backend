import { Controller, All, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { toNodeHandler } from 'better-auth/node';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @All('/*')
  async handler(@Req() req: Request, @Res() res: Response) {
    const betterAuthHandler = toNodeHandler(this.authService.auth);
    
    // Convertimos req y res a 'any' para evitar el error de TypeScript,
    // ya que Express Request hereda de IncomingMessage a nivel de ejecución pero
    // los tipos de TypeScript a veces no se alinean perfectamente.
    return betterAuthHandler(req as any, res as any);
  }
}

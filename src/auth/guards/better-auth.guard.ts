import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class BetterAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // We need to pass the incoming request to better-auth
    // Better-auth expects web standard Request or at least headers
    try {
      const session = await this.authService.auth.api.getSession({
        headers: request.headers,
      });

      if (!session || !session.user) {
        throw new UnauthorizedException('No autenticado');
      }

      // Attach user and session to request
      request.user = session.user;
      request.session = session.session;
      return true;
    } catch (e) {
      throw new UnauthorizedException('No autenticado');
    }
  }
}

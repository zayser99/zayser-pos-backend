import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // We need to pass the web standard headers to better-auth
    // request.headers in express is an object, better-auth might expect a Headers object
    // but the node adapter for better-auth handles standard incoming messages.
    // However, if we just pass request.headers, let's see.
    // The safest way is to construct new Headers if getSession expects it.
    
    let headers = new Headers();
    for (const key in request.headers) {
      if (request.headers[key]) {
        headers.append(key, request.headers[key] as string);
      }
    }

    try {
      const session = await this.authService.auth.api.getSession({
        headers,
      });

      if (!session) {
        throw new UnauthorizedException('Authentication required');
      }

      request.user = session.user;
      request.session = session.session;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or missing session');
    }
  }
}

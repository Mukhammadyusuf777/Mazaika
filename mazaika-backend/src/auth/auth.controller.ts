import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Post('google')
  async loginGoogle(@Body() body: { credential: string }) {
    return this.authService.loginGoogle(body);
  }

  @Post('firebase-sync')
  async firebaseSync(@Body() body: { firebaseUid: string; email?: string; name?: string; phone?: string }) {
    return this.authService.firebaseSync(body);
  }
}

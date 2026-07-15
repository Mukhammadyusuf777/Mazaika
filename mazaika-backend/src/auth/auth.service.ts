import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(data: any) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return { success: false, message: 'Foydalanuvchi allaqachon mavjud' };
    }

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password, // No hashing for MVP simplicity
      },
    });

    return { success: true, user: { id: user.id, name: user.name, email: user.email } };
  }

  async login(data: any) {
    const user = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (!user || user.password !== data.password) {
      return { success: false, message: 'Email yoki parol xato' };
    }

    return { success: true, user: { id: user.id, name: user.name, email: user.email } };
  }
}

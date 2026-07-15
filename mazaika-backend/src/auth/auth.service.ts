import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(data: any) {
    if (!data.email && !data.phone) {
      return { success: false, message: 'Email yoki telefon raqami talab qilinadi' };
    }

    if (data.email) {
      const existingEmail = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (existingEmail) {
        return { success: false, message: 'Ushbu email bilan ro\'yxatdan o\'tilgan' };
      }
    }

    if (data.phone) {
      const existingPhone = await this.prisma.user.findUnique({ where: { phone: data.phone } });
      if (existingPhone) {
        return { success: false, message: 'Ushbu telefon raqami bilan ro\'yxatdan o\'tilgan' };
      }
    }

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        password: data.password,
      },
    });

    return { success: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } };
  }

  async login(data: any) {
    let user = null;
    const identifier = data.email || data.phone || data.identifier;

    if (!identifier) {
      return { success: false, message: 'Email yoki telefon raqami kiritilmagan' };
    }

    if (identifier.includes('@')) {
      user = await this.prisma.user.findUnique({ where: { email: identifier } });
    } else {
      // Find by phone number (or clean up spaces/plus if needed)
      user = await this.prisma.user.findUnique({ where: { phone: identifier } });
    }

    if (!user || user.password !== data.password) {
      return { success: false, message: 'Login yoki parol xato' };
    }

    return { success: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } };
  }

  async loginGoogle(data: { credential: string }) {
    try {
      const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${data.credential}`);
      const payload = await res.json();
      if (payload.error_description) {
        return { success: false, message: 'Google tokeni noto\'g\'ri' };
      }
      
      const { sub: googleId, email, name } = payload;
      if (!googleId) {
        return { success: false, message: 'Google ma\'lumotlari xato' };
      }
      
      // Check if user already exists
      let user = await this.prisma.user.findUnique({ where: { googleId } });
      if (!user && email) {
        user = await this.prisma.user.findUnique({ where: { email } });
      }
      
      if (!user) {
        // Register new user
        user = await this.prisma.user.create({
          data: {
            name: name || 'Google User',
            email: email || null,
            googleId,
            password: Math.random().toString(36).substring(7),
          }
        });
      } else if (!user.googleId) {
        // Link googleId to existing user
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId }
        });
      }
      
      return { success: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }
  async firebaseSync(data: { firebaseUid: string; email?: string; name?: string; phone?: string }) {
    try {
      const { firebaseUid, email, name, phone } = data;

      // 1) Try to find by firebaseUid
      let user = await this.prisma.user.findUnique({ where: { firebaseUid } });

      // 2) Try to find by email (link existing account)
      if (!user && email) {
        user = await this.prisma.user.findUnique({ where: { email } });
        if (user) {
          user = await this.prisma.user.update({ where: { id: user.id }, data: { firebaseUid } });
        }
      }

      // 3) Try to find by phone (link existing account)
      if (!user && phone) {
        user = await this.prisma.user.findUnique({ where: { phone } });
        if (user) {
          user = await this.prisma.user.update({ where: { id: user.id }, data: { firebaseUid } });
        }
      }

      // 4) Create new user
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            name: name || email || phone || 'User',
            email: email || null,
            phone: phone || null,
            firebaseUid,
            password: null,
          },
        });
      }

      return { success: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async register(data) {
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
    async login(data) {
        let user = null;
        const identifier = data.email || data.phone || data.identifier;
        if (!identifier) {
            return { success: false, message: 'Email yoki telefon raqami kiritilmagan' };
        }
        if (identifier.includes('@')) {
            user = await this.prisma.user.findUnique({ where: { email: identifier } });
        }
        else {
            user = await this.prisma.user.findUnique({ where: { phone: identifier } });
        }
        if (!user || user.password !== data.password) {
            return { success: false, message: 'Login yoki parol xato' };
        }
        return { success: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } };
    }
    async loginGoogle(data) {
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
            let user = await this.prisma.user.findUnique({ where: { googleId } });
            if (!user && email) {
                user = await this.prisma.user.findUnique({ where: { email } });
            }
            if (!user) {
                user = await this.prisma.user.create({
                    data: {
                        name: name || 'Google User',
                        email: email || null,
                        googleId,
                        password: Math.random().toString(36).substring(7),
                    }
                });
            }
            else if (!user.googleId) {
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: { googleId }
                });
            }
            return { success: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } };
        }
        catch (e) {
            return { success: false, message: e.message };
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
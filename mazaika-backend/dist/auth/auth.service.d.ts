import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    constructor(prisma: PrismaService);
    register(data: any): Promise<{
        success: boolean;
        message: string;
        user?: undefined;
    } | {
        success: boolean;
        user: {
            id: string;
            name: string;
            email: string | null;
            phone: string | null;
        };
        message?: undefined;
    }>;
    login(data: any): Promise<{
        success: boolean;
        message: string;
        user?: undefined;
    } | {
        success: boolean;
        user: {
            id: string;
            name: string;
            email: string | null;
            phone: string | null;
        };
        message?: undefined;
    }>;
    loginGoogle(data: {
        credential: string;
    }): Promise<{
        success: boolean;
        user: {
            id: string;
            name: string;
            email: string | null;
            phone: string | null;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        user?: undefined;
    }>;
}

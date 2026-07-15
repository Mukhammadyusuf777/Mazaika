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
            email: string;
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
            email: string;
        };
        message?: undefined;
    }>;
}

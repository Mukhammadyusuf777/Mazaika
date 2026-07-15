import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: any): Promise<{
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
    login(body: any): Promise<{
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
    loginGoogle(body: {
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
    firebaseSync(body: {
        firebaseUid: string;
        email?: string;
        name?: string;
        phone?: string;
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

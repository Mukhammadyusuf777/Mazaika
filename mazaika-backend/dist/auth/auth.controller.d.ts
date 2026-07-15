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
            email: string;
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
            email: string;
        };
        message?: undefined;
    }>;
}

import { AuthService } from './auth.service.js';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(body: Record<string, any>): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
        };
    }>;
    login(body: Record<string, any>): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
        };
    }>;
}

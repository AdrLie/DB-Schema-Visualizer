import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service.js';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(email: string, pass: string): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
        };
    }>;
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
        };
    }>;
}

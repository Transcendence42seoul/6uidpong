import { JwtService } from "@nestjs/jwt";
import { Cache } from "cache-manager";
export declare class AuthService {
    private readonly jwtService;
    private readonly cacheManager;
    constructor(jwtService: JwtService, cacheManager: Cache);
    generateAccessToken(id: number): Promise<string>;
    generateRefreshToken(id: number): Promise<any>;
    sendCodeByEmail(id: number, email: string): Promise<void>;
    validateCode(id: number, code: string): Promise<boolean>;
}

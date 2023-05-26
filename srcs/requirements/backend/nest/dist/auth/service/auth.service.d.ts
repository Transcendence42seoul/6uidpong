import { JwtService } from "@nestjs/jwt";
import { Cache } from "cache-manager";
export declare class AuthService {
    private readonly jwtService;
    private readonly cacheManager;
    constructor(jwtService: JwtService, cacheManager: Cache);
    genAccessToken(userId: number): Promise<string>;
    genRefreshToken(userId: number): Promise<string>;
    send2FACode(userId: number, email: string): Promise<void>;
    validate2FACode(userId: number, code: string): Promise<void>;
}

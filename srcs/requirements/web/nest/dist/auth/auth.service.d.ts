import { JwtService } from "@nestjs/jwt";
import { UserDto } from "src/user/dto/user.dto";
import { Repository } from "typeorm";
import { UserEntity } from "../user/user.entity";
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<UserEntity>, jwtService: JwtService);
    generateAccessToken(user: UserDto): Promise<string>;
    generateRefreshToken(id: number): Promise<any>;
    verifyTwoFactorAuth(body: {
        id: number;
        email: string;
    }, req: any): Promise<boolean>;
    verifyVerificationCode(code: string, storedVerificationCode: string, id: number, email: string): Promise<boolean>;
    generateVerificationCode(): string;
    sendVerificationCodeByEmail(email: string, verificationCode: string): Promise<void>;
}

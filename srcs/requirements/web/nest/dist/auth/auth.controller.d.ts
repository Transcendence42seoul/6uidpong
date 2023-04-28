import { Response } from "express";
import { AuthService } from "./auth.service";
import { UserService } from "src/user/user.service";
export declare class AuthController {
    private readonly authService;
    private readonly userService;
    constructor(authService: AuthService, userService: UserService);
    redirectFortytwo(res: Response): void;
    callbackFortytwo(req: any, res: Response): Promise<any>;
    verifyCode(body: {
        id: number;
        code: string;
    }, res: Response, session: Record<string, any>): Promise<any>;
    refreshToken(req: any): Promise<any>;
    verifyTwoFactorAuth(body: {
        id: number;
        email: string;
    }, req: any): Promise<boolean>;
    verifyVerificationCode(body: {
        code: string;
    }, req: any): Promise<boolean>;
}

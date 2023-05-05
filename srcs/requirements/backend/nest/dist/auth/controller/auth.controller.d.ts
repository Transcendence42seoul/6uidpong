import { Response } from "express";
import { AuthService } from "../service/auth.service";
import { UserService } from "src/user/service/user.service";
import { TwoFactorAuthDto } from "../dto/two-factor.auth";
export declare class AuthController {
    private readonly authService;
    private readonly userService;
    constructor(authService: AuthService, userService: UserService);
    redirectFortytwo(res: Response): void;
    callbackFortytwo(req: any, res: Response): Promise<Object>;
    TwoFactorAuthentication(body: TwoFactorAuthDto, res: Response): Promise<Object>;
    refreshToken(req: any): Promise<Object>;
}

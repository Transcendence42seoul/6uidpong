import { Response } from "express";
import { AuthService } from "../service/auth.service";
import { UserService } from "src/user/service/user.service";
import { TwoFactorAuthRequest } from "../dto/two-factor-auth-request.dto";
import { CallbackResponse } from "../dto/callback-response.dto";
import { AccessTokenResponse } from "../dto/access-token-response.dto";
export declare class AuthController {
    private readonly authService;
    private readonly userService;
    constructor(authService: AuthService, userService: UserService);
    redirectFortytwo(res: Response): void;
    callbackFortytwo(req: any, res: Response): Promise<CallbackResponse>;
    TwoFactorAuthentication(body: TwoFactorAuthRequest, res: Response): Promise<AccessTokenResponse>;
    refreshToken(req: any): Promise<AccessTokenResponse>;
}

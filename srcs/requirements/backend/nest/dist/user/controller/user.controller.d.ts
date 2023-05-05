import { UserService } from "../service/user.service";
import { AuthService } from "src/auth/service/auth.service";
import { UserEntity } from "../entity/user.entity";
import { UpdateImageDto } from "../dto/update-image.dto";
import { UpdateNicknameDto } from "../dto/update-nickname.dto";
import { UpdateTwoFactorAuthDto } from "../dto/update-2fa.dto";
export declare class UserController {
    private readonly userService;
    private readonly authService;
    constructor(userService: UserService, authService: AuthService);
    getUser(id: number): Promise<UserEntity>;
    updateNickname(id: number, { nickname }: UpdateNicknameDto): Promise<void>;
    updateImage(id: number, { image }: UpdateImageDto): Promise<void>;
    sendCodeByEmail(id: number): Promise<void>;
    update2FA(id: number, body: UpdateTwoFactorAuthDto): Promise<void>;
}

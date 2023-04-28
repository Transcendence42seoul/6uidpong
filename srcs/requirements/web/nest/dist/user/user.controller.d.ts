import { UserService } from "./user.service";
import { UserDto } from "./dto/user.dto";
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getUser(req: any): Promise<UserDto>;
}

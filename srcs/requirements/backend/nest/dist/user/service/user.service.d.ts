import { Repository } from "typeorm";
import { UserEntity } from "../entity/user.entity";
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: Repository<UserEntity>);
    findUserById(id: number): Promise<UserEntity>;
    findUserByNickname(nickname: string): Promise<UserEntity>;
    createUser(profile: any): Promise<UserEntity>;
    updateNickname(id: number, nickname: string): Promise<void>;
    updateImage(id: number, image: string): Promise<void>;
    updateIsTwoFactor(id: number, is2FA: boolean): Promise<void>;
}

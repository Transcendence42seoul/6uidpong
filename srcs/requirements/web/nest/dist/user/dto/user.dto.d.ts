import { UserEntity } from "../user.entity";
export declare class UserDto {
    constructor(user: UserEntity);
    id: number;
    nickname: string;
    email: string;
    profileImage: string;
    isTwoFactor: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date;
}

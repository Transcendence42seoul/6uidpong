import { UserEntity } from "../user.entity";
export declare class CreateUserDto {
    constructor(id: number, profileImage: string);
    id: number;
    nickname: string;
    profileImage: string;
    toEntity(): UserEntity;
}

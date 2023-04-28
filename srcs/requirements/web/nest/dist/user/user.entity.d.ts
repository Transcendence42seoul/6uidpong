export declare class UserEntity {
    constructor(id?: number, nickname?: string, profileImage?: string);
    id: number;
    nickname: string;
    email: string;
    profileImage: string;
    isTwoFactor: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date;
}

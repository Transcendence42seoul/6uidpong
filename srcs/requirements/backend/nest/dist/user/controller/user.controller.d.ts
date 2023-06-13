/// <reference types="multer" />
import { UserService } from "../service/user.service";
import { AuthService } from "src/auth/service/auth.service";
import { NicknameUpdateRequest } from "../dto/nickname-update-request";
import { TwoFactorAuthUpdateRequest } from "../dto/two-factor-auth-update-request";
import { UserResponse } from "../dto/user-response";
import { Pagination } from "src/utils/pagination/pagination";
import { FriendService } from "../service/friend.service";
import { FriendRequestService } from "../service/friend-request.service";
import { FriendResponse } from "../dto/friend-response";
import { FriendRequestResponse } from "../dto/friend-request-response";
import { Response } from "express";
import { UserProfileResponse } from "../dto/user-profile-response";
export declare class UserController {
    private readonly userService;
    private readonly authService;
    private readonly friendService;
    private readonly friendRequestService;
    constructor(userService: UserService, authService: AuthService, friendService: FriendService, friendRequestService: FriendRequestService);
    findAllUser(page: number, size: number): Promise<Pagination<UserResponse>>;
    searchUser(nickname: string): Promise<UserResponse[]>;
    findProfile(req: any, id: number): Promise<UserProfileResponse>;
    findImage(res: Response, id: number): Promise<void>;
    updateNickname(id: number, body: NicknameUpdateRequest): Promise<void>;
    updateImage(id: number, file: Express.Multer.File): Promise<void>;
    send2FACode(id: number): Promise<void>;
    update2FA(id: number, body: TwoFactorAuthUpdateRequest): Promise<void>;
    findFriends(userId: number): Promise<FriendResponse[]>;
    createFriend(userId: number, friendId: number): Promise<void>;
    deleteFriend(userId: number, friendId: number): Promise<void>;
    findFriendRequests(userId: number): Promise<FriendRequestResponse[]>;
    createFriendRequest(fromId: number, toId: number): Promise<void>;
    deleteFriendRequest(toId: number, fromId: number): Promise<void>;
}

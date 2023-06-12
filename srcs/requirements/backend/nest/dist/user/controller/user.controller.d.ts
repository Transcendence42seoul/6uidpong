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
import { BlockService } from "src/chat/service/dm/block.service";
import { Response } from "express";
export declare class UserController {
    private readonly userService;
    private readonly authService;
    private readonly friendService;
    private readonly friendRequestService;
    private readonly blockService;
    constructor(userService: UserService, authService: AuthService, friendService: FriendService, friendRequestService: FriendRequestService, blockService: BlockService);
    findAllUser(page: number, size: number): Promise<Pagination<UserResponse>>;
    searchUser(nickname: string): Promise<UserResponse[]>;
    findUser(req: any, id: number): Promise<UserResponse>;
    streamImage(res: Response, id: number): Promise<void>;
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

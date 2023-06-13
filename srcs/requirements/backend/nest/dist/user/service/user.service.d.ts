/// <reference types="multer" />
import { PaginationOptions } from "src/utils/pagination/pagination.option";
import { DataSource, Repository } from "typeorm";
import { User } from "../entity/user.entity";
import { Response } from "express";
import { Pagination } from "src/utils/pagination/pagination";
import { UserResponse } from "../dto/user-response";
import { UserProfileResponse } from "../dto/user-profile-response";
import { BlockService } from "src/chat/service/dm/block.service";
import { FriendService } from "./friend.service";
export declare class UserService {
    private readonly userRepository;
    private readonly blockService;
    private readonly friendService;
    private readonly dataSource;
    constructor(userRepository: Repository<User>, blockService: BlockService, friendService: FriendService, dataSource: DataSource);
    findAll(options: PaginationOptions): Promise<Pagination<UserResponse>>;
    findOne(id: number | string): Promise<User>;
    find(ids: number[]): Promise<User[]>;
    search(nickname: string): Promise<UserResponse[]>;
    insert(profile: any): Promise<User>;
    findProfile(targetId: number, requesterId: number): Promise<UserProfileResponse>;
    updateNickname(id: number, nickname: string): Promise<void>;
    updateImage(id: number, file: Express.Multer.File): Promise<void>;
    updateIsTwoFactor(id: number, is2FA: boolean): Promise<void>;
    updateGameSocket(id: number, gameSocketId: string): Promise<void>;
    updateStatus(id: number): Promise<void>;
    findBySocketId(id: string | null): Promise<User | null>;
    streamImage(res: Response, id: number): Promise<void>;
}

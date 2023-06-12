import { PaginationOptions } from "src/utils/pagination/pagination.option";
import { DataSource, Repository } from "typeorm";
import { User } from "../entity/user.entity";
import { Response } from "express";
export declare class UserService {
    private readonly userRepository;
    private readonly dataSource;
    constructor(userRepository: Repository<User>, dataSource: DataSource);
    findAll(options: PaginationOptions): Promise<[User[], number]>;
    findOne(id: number | string): Promise<User>;
    find(ids: number[]): Promise<User[]>;
    search(nickname: string): Promise<User[]>;
    insert(profile: any): Promise<User>;
    updateNickname(id: number, nickname: string): Promise<void>;
    updateImage(id: number, file: Express.Multer.File): Promise<void>;
    updateIsTwoFactor(id: number, is2FA: boolean): Promise<void>;
    updateGameSocket(id: number, gameSocketId: string): Promise<void>;
    updateStatus(id: number): Promise<void>;
    findBySocketId(id: string | null): Promise<User | null>;
    streamImage(res: Response, id: number): Promise<void>;
}

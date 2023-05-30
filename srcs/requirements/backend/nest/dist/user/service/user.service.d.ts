import { PaginationOptions } from "src/utils/pagination/pagination.option";
import { DataSource, Repository } from "typeorm";
import { User } from "../entity/user.entity";
export declare class UserService {
    private readonly userRepository;
    private readonly dataSource;
    constructor(userRepository: Repository<User>, dataSource: DataSource);
    findAll(options: PaginationOptions): Promise<[User[], number]>;
    findOneOrFail(id: number | string): Promise<User>;
    find(ids: number[]): Promise<User[]>;
    search(nickname: string): Promise<User[]>;
    save(profile: any): Promise<User>;
    updateNickname(id: number, nickname: string): Promise<void>;
    updateImage(id: number, image: string): Promise<void>;
    updateIsTwoFactor(id: number, is2FA: boolean): Promise<void>;
}

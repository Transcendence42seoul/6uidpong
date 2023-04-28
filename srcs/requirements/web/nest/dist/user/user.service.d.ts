import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserDto } from "./dto/user.dto";
import { UserEntity } from "./user.entity";
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: Repository<UserEntity>);
    findUser(id: number): Promise<UserDto | null>;
    createUser(createUserDto: CreateUserDto): Promise<UserDto>;
}

import { Injectable } from "@nestjs/common";
import { InjectConnection , InjectRepository } from "@nestjs/typeorm";
import { Connection, Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserEntity } from "./user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async findUser(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const user = await this.userRepository.save(createUserDto.toEntity());
    return user;
  }
}

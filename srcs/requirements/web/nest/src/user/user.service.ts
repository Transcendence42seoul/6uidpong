import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserEntity } from "./user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async findUser(token_id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { token_id } });
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const user = await this.userRepository.save(createUserDto.toEntity());
    return user;
  }
}

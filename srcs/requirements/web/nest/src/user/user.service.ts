import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserDto } from "./dto/user.dto";
import { UserEntity } from "./user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findUser(id: number): Promise<UserDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    return new UserDto(user);
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserDto> {
    const user = await this.userRepository.save(createUserDto.toEntity());
    return new UserDto(user);
  }
}

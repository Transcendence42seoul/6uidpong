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
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async findUser(id: number): Promise<UserDto | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user ? new UserDto(user) : null;
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserDto> {
    const user = await this.userRepository.save(createUserDto.toEntity());
    return new UserDto(user);
  }
}

import { Injectable, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../entity/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async findUser(id: number): Promise<UserEntity> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async createUser(
    id: number,
    email: string,
    profileImage: string
  ): Promise<UserEntity> {
    const info = this.userRepository.create({
      id: id,
      nickname: `undefined-${id}`,
      email: email,
      profileImage: profileImage,
    });
    return await this.userRepository.save(info);
  }

  async updateNickname(id: number, nickname: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { nickname: nickname },
    });
    if (user) {
      throw new ConflictException();
    }
    await this.userRepository.update(id, { nickname: nickname });
  }

  async updateImage(id: number, image: string): Promise<void> {
    await this.userRepository.update(id, { image: image });
  }

  async updateIsTwoFactor(id: number, is2FA: boolean): Promise<void> {
    await this.userRepository.update(id, {
      is2FA: is2FA,
    });
  }
}

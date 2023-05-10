import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../entity/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async findUserById(id: number): Promise<UserEntity> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findUserByNickname(nickname: string): Promise<UserEntity> {
    return await this.userRepository.findOne({ where: { nickname } });
  }

  async createUser(profile: any): Promise<UserEntity> {
    const profileEntity: Object = this.userRepository.create({
      id: profile.id,
      nickname: `undefined-${profile.id}`,
      email: profile.email,
      image: profile.image.link,
    });
    return await this.userRepository.save(profileEntity);
  }

  async updateNickname(id: number, nickname: string): Promise<void> {
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

  async updateStatus(id: number, status: string): Promise<void> {
    await this.userRepository.update(id, {
      status: status,
    });
  }
}

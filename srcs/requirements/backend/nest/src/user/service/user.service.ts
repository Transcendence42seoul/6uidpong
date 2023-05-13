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

  async findUserById(id: number | string): Promise<UserEntity> {
    if (typeof id === "number")
      return await this.userRepository.findOneOrFail({ where: { id: id } });
    return await this.userRepository.findOneOrFail({ where: { socketId: id } });
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

  async updateNickname(userId: number, nickname: string): Promise<void> {
    await this.userRepository.update(userId, { nickname: nickname });
  }

  async updateImage(userId: number, image: string): Promise<void> {
    await this.userRepository.update(userId, { image: image });
  }

  async updateIsTwoFactor(userId: number, is2FA: boolean): Promise<void> {
    await this.userRepository.update(userId, {
      is2FA: is2FA,
    });
  }

  async updateSocketId(id: number | string, socketId: string): Promise<void> {
    const findOptions: { id?: number; socketId?: string } = {};
    if (typeof id === "number") {
      findOptions.id = id;
    } else {
      findOptions.socketId = id;
    }
    await this.userRepository.update(findOptions, {
      socketId: socketId,
    });
  }

  async updateStatus(id: number | string, status: string): Promise<void> {
    const findOptions: { id?: number; socketId?: string } = {};
    if (typeof id === "number") {
      findOptions.id = id;
    } else {
      findOptions.socketId = id;
    }
    await this.userRepository.update(findOptions, {
      status: status,
    });
  }
}

import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { UserEntity } from "../entity/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource
  ) {}

  async findUser(id: number | string): Promise<UserEntity> {
    if (typeof id === "number")
      return await this.userRepository.findOneOrFail({ where: { id: id } });
    return await this.userRepository.findOneOrFail({ where: { socketId: id } });
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
    const queryRunner = this.dataSource.createQueryRunner();
    const userRepository = queryRunner.manager.getRepository(UserEntity);

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user: UserEntity = await userRepository.findOneBy({
        nickname,
      });
      if (user) {
        throw new ConflictException();
      }
      await userRepository.update(id, { nickname });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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

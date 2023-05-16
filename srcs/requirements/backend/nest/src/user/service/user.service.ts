import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, ILike, Like, Repository } from "typeorm";
import { UserEntity } from "../entity/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number | string): Promise<UserEntity> {
    if (typeof id === "number")
      return await this.userRepository.findOneOrFail({ where: { id: id } });
    return await this.userRepository.findOneOrFail({ where: { socketId: id } });
  }

  async search(nickname: string): Promise<UserEntity[]> {
    return this.userRepository
      .createQueryBuilder()
      .select()
      .where("nickname ILIKE :includedNickname")
      .orderBy(
        "CASE WHEN nickname = :nickname THEN 0 \
              WHEN nickname ILIKE :startNickname THEN 1 \
              WHEN nickname ILIKE :includedNickname THEN 2 \
              WHEN nickname ILIKE :endNickname THEN 3 \
              ELSE 4 END"
      )
      .setParameters({
        includedNickname: `%${nickname}%`,
        nickname: nickname,
        startNickname: `${nickname}%`,
        endNickname: `%${nickname}`,
      })
      .getMany();
  }

  async create(profile: any): Promise<UserEntity> {
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

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user: UserEntity = await queryRunner.manager.findOneBy(UserEntity, {
        nickname,
      });
      if (user) {
        throw new ConflictException();
      }
      await queryRunner.manager.update(UserEntity, id, { nickname });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateImage(id: number, image: string): Promise<void> {
    await this.userRepository.update(id, {
      image,
    });
  }

  async updateIsTwoFactor(id: number, is2FA: boolean): Promise<void> {
    await this.userRepository.update(id, {
      is2FA,
    });
  }
}

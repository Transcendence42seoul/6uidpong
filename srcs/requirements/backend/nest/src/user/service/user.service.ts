import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginationOptions } from "src/utils/pagination/pagination.option";
import { DataSource, Repository } from "typeorm";
import { UserEntity } from "../entity/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource
  ) {}

  async findAll(options: PaginationOptions): Promise<[UserEntity[], number]> {
    return await this.userRepository.findAndCount({
      take: options.size,
      skip: options.size * (options.page - 1),
      order: {
        nickname: "ASC",
      },
    });
  }

  async findOne(id: number | string): Promise<UserEntity> {
    if (typeof id === "number")
      return await this.userRepository.findOneOrFail({ where: { id: id } });
    return await this.userRepository.findOneOrFail({ where: { socketId: id } });
  }

  async search(
    nickname: string,
    options: PaginationOptions
  ): Promise<[UserEntity[], number]> {
    return this.userRepository
      .createQueryBuilder()
      .select()
      .where("nickname ILIKE :includedNickname")
      .orderBy(
        "CASE WHEN nickname = :nickname THEN 0 \
              WHEN nickname ILIKE :startNickname THEN 1 \
              WHEN nickname ILIKE :includedNickname THEN 2 \
              WHEN nickname ILIKE :endNickname THEN 3 \
              ELSE 4 \
        END"
      )
      .limit(options.size)
      .offset(options.size * (options.page - 1))
      .setParameters({
        includedNickname: `%${nickname}%`,
        nickname: nickname,
        startNickname: `${nickname}%`,
        endNickname: `%${nickname}`,
      })
      .getManyAndCount();
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

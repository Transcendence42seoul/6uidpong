import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginationOptions } from "src/utils/pagination/pagination.option";
import { DataSource, EntityNotFoundError, Repository } from "typeorm";
import { User } from "../entity/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource
  ) {}

  async findAll(options: PaginationOptions): Promise<[User[], number]> {
    return await this.userRepository.findAndCount({
      take: options.size,
      skip: options.size * (options.page - 1),
      order: {
        nickname: "ASC",
      },
    });
  }

  async findOne(id: number | string): Promise<User> {
    if (typeof id === "number") {
      return await this.userRepository.findOneOrFail({ where: { id } });
    }
    return await this.userRepository.findOneOrFail({ where: { socketId: id } });
  }

  async find(ids: number[]): Promise<User[]> {
    return await this.userRepository.findBy(ids.map((id) => ({ id })));
  }

  async search(nickname: string): Promise<User[]> {
    return await this.userRepository
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
      .setParameters({
        includedNickname: `%${nickname}%`,
        nickname: nickname,
        startNickname: `${nickname}%`,
        endNickname: `%${nickname}`,
      })
      .getMany();
  }

  async insert(profile: any): Promise<User> {
    await this.userRepository.insert({
      id: profile.id,
      nickname: `undefined-${profile.id}`,
      email: profile.email,
      image: profile.image.link,
    });
    return await this.userRepository.findOneBy({ id: profile.id });
  }

  async updateNickname(id: number, nickname: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user: User = await queryRunner.manager.findOneBy(User, {
        nickname,
      });
      if (user) {
        throw new ConflictException();
      }
      await queryRunner.manager.update(User, id, { nickname });

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

  async updateStatus(
    id: number,
    gameSocketId: string,
    status: string
  ): Promise<void> {
    await this.userRepository.update(id, {
      status,
    });
    await this.userRepository.update(id, {
      gameSocketId: gameSocketId,
    });
  }

  async findBySocketId(id: string): Promise<User> {
    return await this.userRepository.findOneOrFail({
      where: { gameSocketId: id },
    });
  }
}

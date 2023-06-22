import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginationOptions } from "src/utils/pagination/pagination.option";
import { Repository } from "typeorm";
import { User } from "../entity/user.entity";
import { existsSync, mkdirSync, writeFileSync, createReadStream } from "fs";
import { Response } from "express";
import { Pagination } from "src/utils/pagination/pagination";
import { UserResponse } from "../dto/user-response";
import { UserProfileResponse } from "../dto/user-profile-response";
import { BlockService } from "src/chat/service/dm/block.service";
import { FriendService } from "./friend.service";
import { Block } from "src/chat/entity/dm/block.entity";
import { Friend } from "../entity/friend.entity";
import { FriendRequestService } from "./friend-request.service";
import { FriendRequest } from "../entity/friend-request.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly blockService: BlockService,
    private readonly friendService: FriendService,
    private readonly friendRequestService: FriendRequestService
  ) {}

  async findAll(options: PaginationOptions): Promise<Pagination<UserResponse>> {
    const [users, total]: [User[], number] =
      await this.userRepository.findAndCount({
        take: options.size,
        skip: options.size * (options.page - 1),
        order: {
          nickname: "ASC",
        },
      });
    return new Pagination<UserResponse>({
      results: users.map((user) => new UserResponse(user)),
      total,
    });
  }

  async findOne(id: number | string): Promise<User> {
    if (typeof id === "number") {
      return await this.userRepository.findOne({ where: { id } });
    }
    return await this.userRepository.findOne({ where: { socketId: id } });
  }

  async findOneOrFail(id: number | string): Promise<User> {
    if (typeof id === "number") {
      return await this.userRepository.findOneOrFail({ where: { id } });
    }
    return await this.userRepository.findOneOrFail({ where: { socketId: id } });
  }

  async find(ids: number[]): Promise<User[]> {
    return await this.userRepository.findBy(ids.map((id) => ({ id })));
  }

  async search(nickname: string): Promise<UserResponse[]> {
    const entities: User[] = await this.userRepository
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
    return entities.map((entity) => new UserResponse(entity));
  }

  async insert(profile: any): Promise<User> {
    await this.userRepository.insert({
      id: profile.id,
      nickname: `undefined-${profile.id}`,
      email: profile.email,
      image: profile.image ? profile.image.link : "",
    });
    return await this.userRepository.findOneBy({ id: profile.id });
  }

  async findProfile(
    targetId: number,
    requesterId: number
  ): Promise<UserProfileResponse> {
    const user: User = await this.userRepository.findOneBy({ id: targetId });
    if (!user) {
      throw new NotFoundException();
    }
    const friend: Friend = await this.friendService.findOne(
      requesterId,
      targetId
    );
    const friendRequest: FriendRequest =
      await this.friendRequestService.findOne(requesterId, targetId);
    return new UserProfileResponse(
      user,
      await this.blockService.isBlocked(requesterId, targetId),
      friend ? true : false,
      friendRequest ? true : false
    );
  }

  async updateNickname(id: number, nickname: string): Promise<void> {
    await this.userRepository.update(id, { nickname });
  }

  async updateImage(id: number, file: Express.Multer.File): Promise<void> {
    const uploadPath: string = `uploads/${id}`;
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    writeFileSync(`${uploadPath}/image.jpeg`, file.buffer);
    await this.userRepository.update(id, {
      image: `https://${process.env.HOST_NAME}/api/v1/users/${id}/image`,
    });
  }

  async updateIsTwoFactor(id: number, is2FA: boolean): Promise<void> {
    await this.userRepository.update(id, {
      is2FA,
    });
  }

  async updateGameSocket(id: number, gameSocketId: string): Promise<void> {
    await this.userRepository.update(id, {
      gameSocketId: gameSocketId,
    });
  }

  async updateStatus(id: number): Promise<void> {
    await this.userRepository.update(id, {
      status: "game",
    });
  }

  async findBySocketId(id: string | null): Promise<User | null> {
    if (id !== null) {
      return await this.userRepository.findOne({
        where: { gameSocketId: id },
      });
    }
    return null;
  }

  async streamImage(res: Response, id: number): Promise<void> {
    const imagePath: string = `uploads/${id}/image.jpeg`;
    if (!existsSync(imagePath)) {
      throw new NotFoundException();
    }
    const fileStream = createReadStream(imagePath);
    res.set({
      "Content-Type": "image/jpeg",
    });
    fileStream.pipe(res);
  }

  async findOneByNickname(nickname: string): Promise<User> {
    return await this.userRepository.findOneBy({ nickname });
  }
}

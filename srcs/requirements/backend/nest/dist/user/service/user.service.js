"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entity/user.entity");
let UserService = class UserService {
    constructor(userRepository, dataSource) {
        this.userRepository = userRepository;
        this.dataSource = dataSource;
    }
    async findAll(options) {
        return await this.userRepository.findAndCount({
            take: options.size,
            skip: options.size * (options.page - 1),
            order: {
                nickname: "ASC",
            },
        });
    }
    async findOne(id) {
        if (typeof id === "number") {
            return await this.userRepository.findOneOrFail({ where: { id } });
        }
        return await this.userRepository.findOneOrFail({ where: { socketId: id } });
    }
    async find(ids) {
        return await this.userRepository.findBy(ids.map((id) => ({ id })));
    }
    async search(nickname) {
        return await this.userRepository
            .createQueryBuilder()
            .select()
            .where("nickname ILIKE :includedNickname")
            .orderBy("CASE WHEN nickname = :nickname THEN 0 \
              WHEN nickname ILIKE :startNickname THEN 1 \
              WHEN nickname ILIKE :includedNickname THEN 2 \
              WHEN nickname ILIKE :endNickname THEN 3 \
              ELSE 4 \
        END")
            .setParameters({
            includedNickname: `%${nickname}%`,
            nickname: nickname,
            startNickname: `${nickname}%`,
            endNickname: `%${nickname}`,
        })
            .getMany();
    }
    async insert(profile) {
        await this.userRepository.insert({
            id: profile.id,
            nickname: `undefined-${profile.id}`,
            email: profile.email,
            image: profile.image.link,
        });
        return await this.userRepository.findOneBy({ id: profile.id });
    }
    async updateNickname(id, nickname) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const user = await queryRunner.manager.findOneBy(user_entity_1.User, {
                nickname,
            });
            if (user) {
                throw new common_1.ConflictException();
            }
            await queryRunner.manager.update(user_entity_1.User, id, { nickname });
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async updateImage(id, image) {
        await this.userRepository.update(id, {
            image,
        });
    }
    async updateIsTwoFactor(id, is2FA) {
        await this.userRepository.update(id, {
            is2FA,
        });
    }
    async updateStatus(id, gameSocketId, status) {
        await this.userRepository.update(id, {
            status,
        });
        await this.userRepository.update(id, {
            gameSocketId: gameSocketId,
        });
    }
    async findBySocketId(id) {
        return await this.userRepository.findOneOrFail({
            where: { gameSocketId: id },
        });
    }
};
UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map
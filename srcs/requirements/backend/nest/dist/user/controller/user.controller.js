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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../service/user.service");
const jwt_access_guard_1 = require("../../auth/guard/jwt-access.guard");
const auth_service_1 = require("../../auth/service/auth.service");
const update_image_dto_1 = require("../dto/update-image.dto");
const update_nickname_dto_1 = require("../dto/update-nickname.dto");
const update_2fa_dto_1 = require("../dto/update-2fa.dto");
let UserController = class UserController {
    constructor(userService, authService) {
        this.userService = userService;
        this.authService = authService;
    }
    async getUser(id) {
        return await this.userService.findUserById(id);
    }
    async updateNickname(id, { nickname }) {
        const user = await this.userService.findUserByNickname(nickname);
        if (user) {
            throw new common_1.ConflictException();
        }
        await this.userService.updateNickname(id, nickname);
    }
    async updateImage(id, { image }) {
        await this.userService.updateImage(id, image);
    }
    async sendCodeByEmail(id) {
        const { email } = await this.userService.findUserById(id);
        await this.authService.sendCodeByEmail(id, email);
    }
    async update2FA(id, body) {
        if (!(await this.authService.validateCode(id, body.code))) {
            throw new common_1.UnauthorizedException();
        }
        await this.userService.updateIsTwoFactor(id, body.is2FA);
    }
};
__decorate([
    (0, common_1.Get)("/:id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUser", null);
__decorate([
    (0, common_1.Put)("/:id/nickname"),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_nickname_dto_1.UpdateNicknameDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateNickname", null);
__decorate([
    (0, common_1.Put)("/:id/image"),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_image_dto_1.UpdateImageDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateImage", null);
__decorate([
    (0, common_1.Put)("/:id/email/code"),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "sendCodeByEmail", null);
__decorate([
    (0, common_1.Put)("/:id/is2FA"),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_2fa_dto_1.UpdateTwoFactorAuthDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update2FA", null);
UserController = __decorate([
    (0, common_1.Controller)("api/v1/users"),
    (0, common_1.UseGuards)(jwt_access_guard_1.JwtAccessGuard),
    __metadata("design:paramtypes", [user_service_1.UserService,
        auth_service_1.AuthService])
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map
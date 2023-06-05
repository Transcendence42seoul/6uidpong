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
const image_update_request_1 = require("../dto/image-update-request");
const nickname_update_request_1 = require("../dto/nickname-update-request");
const two_factor_auth_update_request_1 = require("../dto/two-factor-auth-update-request");
const user_response_1 = require("../dto/user-response");
const pagination_1 = require("../../utils/pagination/pagination");
const friend_service_1 = require("../service/friend.service");
const friend_request_service_1 = require("../service/friend-request.service");
const friend_response_1 = require("../dto/friend-response");
const friend_request_response_1 = require("../dto/friend-request-response");
const permission_guard_1 = require("../../auth/guard/permission.guard");
let UserController = class UserController {
    constructor(userService, authService, friendService, friendRequestService) {
        this.userService = userService;
        this.authService = authService;
        this.friendService = friendService;
        this.friendRequestService = friendRequestService;
    }
    async findAllUser(page, size) {
        const [users, total] = await this.userService.findAll({
            page,
            size,
        });
        const dtos = users.map((user) => new user_response_1.UserResponse(user));
        return new pagination_1.Pagination({ results: dtos, total });
    }
    async searchUser(nickname) {
        const entities = await this.userService.search(nickname);
        return entities.map((entity) => new user_response_1.UserResponse(entity));
    }
    async findUser(id) {
        try {
            const user = await this.userService.findOne(id);
            return new user_response_1.UserResponse(user);
        }
        catch (_a) {
            throw new common_1.NotFoundException("user not exists.");
        }
    }
    async updateNickname(id, body) {
        await this.userService.updateNickname(id, body.nickname);
    }
    async updateImage(id, body) {
        await this.userService.updateImage(id, body.image);
    }
    async send2FACode(id) {
        const { email } = await this.userService.findOne(id);
        await this.authService.send2FACode(id, email);
    }
    async update2FA(id, body) {
        await this.authService.validate2FACode(id, body.code);
        await this.userService.updateIsTwoFactor(id, body.is2FA);
    }
    async findFriends(userId) {
        const friends = await this.friendService.find(userId);
        return friends.map((friend) => new friend_response_1.FriendResponse(friend));
    }
    async createFriend(userId, friendId) {
        await this.friendService.insert(userId, friendId);
    }
    async deleteFriend(userId, friendId) {
        await this.friendService.delete(userId, friendId);
    }
    async findFriendRequests(userId) {
        const friendRequests = await this.friendRequestService.find(userId);
        return friendRequests.map((friendRequest) => new friend_request_response_1.FriendRequestResponse(friendRequest));
    }
    async createFriendRequest(fromId, toId) {
        try {
            await this.friendService.findOne(fromId, toId);
            throw new common_1.BadRequestException("already friends.");
        }
        catch (_a) {
            await this.friendRequestService.insert(fromId, toId);
        }
    }
    async deleteFriendRequest(toId, fromId) {
        await this.friendRequestService.delete(fromId, toId);
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("page", new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)("size", new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAllUser", null);
__decorate([
    (0, common_1.Get)("/search"),
    __param(0, (0, common_1.Query)("nickname")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "searchUser", null);
__decorate([
    (0, common_1.Get)("/:id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findUser", null);
__decorate([
    (0, common_1.Put)("/:id/nickname"),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, nickname_update_request_1.NicknameUpdateRequest]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateNickname", null);
__decorate([
    (0, common_1.Put)("/:id/image"),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, image_update_request_1.ImageUpdateRequest]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateImage", null);
__decorate([
    (0, common_1.Put)("/:id/email/code"),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "send2FACode", null);
__decorate([
    (0, common_1.Put)("/:id/is2FA"),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, two_factor_auth_update_request_1.TwoFactorAuthUpdateRequest]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update2FA", null);
__decorate([
    (0, common_1.Get)("/:id/friends"),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findFriends", null);
__decorate([
    (0, common_1.Post)("/:id/friends"),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)("friendId", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createFriend", null);
__decorate([
    (0, common_1.Delete)("/:id/friends/:friendId"),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)("friendId", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteFriend", null);
__decorate([
    (0, common_1.Get)("/:id/friend-requests"),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findFriendRequests", null);
__decorate([
    (0, common_1.Post)("/:id/friend-requests"),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)("toId", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createFriendRequest", null);
__decorate([
    (0, common_1.Delete)("/:id/friend-requests/:fromId"),
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)("fromId", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteFriendRequest", null);
UserController = __decorate([
    (0, common_1.Controller)("api/v1/users"),
    (0, common_1.UseGuards)(jwt_access_guard_1.JwtAccessGuard),
    __metadata("design:paramtypes", [user_service_1.UserService,
        auth_service_1.AuthService,
        friend_service_1.FriendService,
        friend_request_service_1.FriendRequestService])
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map
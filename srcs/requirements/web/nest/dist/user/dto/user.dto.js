"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDto = void 0;
class UserDto {
    constructor(user) {
        this.id = user.id;
        this.nickname = user.nickname;
        this.email = user.email;
        this.profileImage = user.profileImage;
        this.isTwoFactor = user.isTwoFactor;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
        this.lastLoginAt = user.lastLoginAt;
    }
}
exports.UserDto = UserDto;
//# sourceMappingURL=user.dto.js.map
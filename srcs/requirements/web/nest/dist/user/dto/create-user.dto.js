"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserDto = void 0;
const user_entity_1 = require("../user.entity");
class CreateUserDto {
    constructor(id, profileImage) {
        this.id = id;
        this.nickname = `undefined-${id}`;
        this.profileImage = profileImage;
    }
    toEntity() {
        return new user_entity_1.UserEntity(this.id, this.nickname, this.profileImage);
    }
}
exports.CreateUserDto = CreateUserDto;
//# sourceMappingURL=create-user.dto.js.map
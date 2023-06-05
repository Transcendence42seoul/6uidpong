"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../entity/user.entity");
const user_service_1 = require("../service/user.service");
const user_controller_1 = require("../controller/user.controller");
const auth_module_1 = require("../../auth/module/auth.module");
const friend_request_entity_1 = require("../entity/friend-request.entity");
const friend_request_service_1 = require("../service/friend-request.service");
const friend_entity_1 = require("../entity/friend.entity");
const friend_service_1 = require("../service/friend.service");
const chat_module_1 = require("../../chat/module/chat.module");
let UserModule = class UserModule {
};
UserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, friend_entity_1.Friend, friend_request_entity_1.FriendRequest]),
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
            (0, common_1.forwardRef)(() => chat_module_1.ChatModule),
        ],
        providers: [user_service_1.UserService, friend_service_1.FriendService, friend_request_service_1.FriendRequestService],
        exports: [user_service_1.UserService],
        controllers: [user_controller_1.UserController],
    })
], UserModule);
exports.UserModule = UserModule;
//# sourceMappingURL=user.module.js.map
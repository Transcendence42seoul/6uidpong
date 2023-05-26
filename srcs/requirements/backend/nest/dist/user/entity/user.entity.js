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
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const channel_chat_entity_1 = require("../../chat/entity/channel/channel-chat.entity");
const channel_user_entity_1 = require("../../chat/entity/channel/channel-user.entity");
const dm_chat_entity_1 = require("../../chat/entity/dm/dm-chat.entity");
const dm_room_user_entity_1 = require("../../chat/entity/dm/dm-room-user.entity");
const typeorm_1 = require("typeorm");
const friend_request_entity_1 = require("./friend-request.entity");
const friend_entity_1 = require("./friend.entity");
let User = class User {
};
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], User.prototype, "nickname", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_2fa", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "is2FA", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: "offline",
    }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "win_stat", default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "winStat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "lose_stat", default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "loseStat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "ladder_score", default: 1000 }),
    __metadata("design:type", Number)
], User.prototype, "ladderScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "socket_id", default: "" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], User.prototype, "socketId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => dm_room_user_entity_1.DmRoomUser, (dmRoomUser) => dmRoomUser.user),
    __metadata("design:type", Array)
], User.prototype, "dmRoomUsers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => dm_chat_entity_1.DmChat, (chat) => chat.user),
    __metadata("design:type", Array)
], User.prototype, "dmChats", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => channel_user_entity_1.ChannelUser, (channelUser) => channelUser.user),
    __metadata("design:type", Array)
], User.prototype, "channelUsers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => channel_chat_entity_1.ChannelChat, (chat) => chat.user),
    __metadata("design:type", Array)
], User.prototype, "channelChats", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => friend_entity_1.Friend, (friend) => friend.friend),
    __metadata("design:type", Array)
], User.prototype, "friends", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => friend_request_entity_1.FriendRequest, (friendRequest) => friendRequest.from),
    __metadata("design:type", Array)
], User.prototype, "friendRequests", void 0);
User = __decorate([
    (0, typeorm_1.Entity)("users")
], User);
exports.User = User;
//# sourceMappingURL=user.entity.js.map
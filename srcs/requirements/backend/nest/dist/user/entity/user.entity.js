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
exports.UserEntity = void 0;
const typeorm_1 = require("typeorm");
let UserEntity = class UserEntity {
};
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], UserEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "nickname", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserEntity.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_2fa", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "is2FA", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "offline" }),
    __metadata("design:type", String)
], UserEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "win_stat", default: 0 }),
    __metadata("design:type", Number)
], UserEntity.prototype, "winStat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "lose_stat", default: 0 }),
    __metadata("design:type", Number)
], UserEntity.prototype, "loseStat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "ladder_score", default: 1000 }),
    __metadata("design:type", Number)
], UserEntity.prototype, "ladderScore", void 0);
UserEntity = __decorate([
    (0, typeorm_1.Entity)("users")
], UserEntity);
exports.UserEntity = UserEntity;
//# sourceMappingURL=user.entity.js.map
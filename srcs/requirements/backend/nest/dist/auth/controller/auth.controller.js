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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const auth_service_1 = require("../service/auth.service");
const user_service_1 = require("../../user/service/user.service");
const jwt_refresh_guard_1 = require("../guard/jwt-refresh.guard");
const ft_guard_1 = require("../guard/ft.guard");
const two_factor_auth_1 = require("../dto/two-factor.auth");
const OAUTH_42_LOGIN_URL = `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.OAUTH_42_CLIENT_ID}&redirect_uri=https://${process.env.HOST_NAME}/auth/social/callback/forty-two&response_type=code&scope=public`;
let AuthController = class AuthController {
    constructor(authService, userService) {
        this.authService = authService;
        this.userService = userService;
    }
    redirectFortytwo(res) {
        res.status(common_1.HttpStatus.FOUND).redirect(OAUTH_42_LOGIN_URL);
    }
    async callbackFortytwo(req, res) {
        let user = await this.userService.findUserById(req.user.id);
        if (user === null || user === void 0 ? void 0 : user.is2FA) {
            this.authService.sendCodeByEmail(user.id, user.email);
            return { is2FA: true, id: user.id, accessToken: null };
        }
        if (!user) {
            user = await this.userService.createUser(req.user);
            res.status(common_1.HttpStatus.CREATED);
            res.setHeader("Location", `/api/v1/users/${user.id}`);
        }
        const refreshToken = await this.authService.generateRefreshToken(user.id);
        res.cookie("refresh", refreshToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
            secure: true,
            sameSite: "strict",
            path: "/api/v1/auth/token/refresh",
        });
        const accessToken = await this.authService.generateAccessToken(user.id);
        return { is2FA: false, id: user.id, accessToken: accessToken };
    }
    async TwoFactorAuthentication(body, res) {
        if (!(await this.authService.validateCode(body.id, body.code))) {
            throw new common_1.UnauthorizedException();
        }
        const refreshToken = await this.authService.generateRefreshToken(body.id);
        res.cookie("refresh", refreshToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
            secure: true,
            sameSite: "strict",
            path: "/api/v1/auth/token/refresh",
        });
        const accessToken = await this.authService.generateAccessToken(body.id);
        return { accessToken: accessToken };
    }
    async refreshToken(req) {
        const accessToken = await this.authService.generateAccessToken(req.user.id);
        return { accessToken: accessToken };
    }
};
__decorate([
    (0, common_1.Get)("/social/redirect/forty-two"),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _a : Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "redirectFortytwo", null);
__decorate([
    (0, common_1.Post)("/social/callback/forty-two"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(ft_guard_1.FtGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "callbackFortytwo", null);
__decorate([
    (0, common_1.Post)("/2fa"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [two_factor_auth_1.TwoFactorAuthDto, typeof (_c = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "TwoFactorAuthentication", null);
__decorate([
    (0, common_1.Get)("/token/refresh"),
    (0, common_1.UseGuards)(jwt_refresh_guard_1.JwtRefreshGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
AuthController = __decorate([
    (0, common_1.Controller)("api/v1/auth"),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        user_service_1.UserService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map
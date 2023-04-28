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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const user_service_1 = require("../user/user.service");
const jwt_refresh_guard_1 = require("./jwt-refresh.guard");
const oauth_guard_1 = require("./oauth.guard");
const create_user_dto_1 = require("../user/dto/create-user.dto");
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
        let user = await this.userService.findUser(req.user.id);
        if (user === null || user === void 0 ? void 0 : user.isTwoFactor) {
            const code = this.authService.generateVerificationCode();
            this.authService.sendVerificationCodeByEmail(user.email, code);
            req.session.code = code;
            const accessToken = await this.authService.generateAccessToken(user);
            return { accessToken };
        }
        if (!user) {
            user = await this.userService.createUser(new create_user_dto_1.CreateUserDto(req.user.id, req.user.image.link));
        }
        const refreshToken = await this.authService.generateRefreshToken(user.id);
        res.cookie("refresh", refreshToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
            secure: true,
            sameSite: "strict",
            path: "/api/v1/auth/token/refresh",
        });
        const accessToken = await this.authService.generateAccessToken(user);
        return { accessToken };
    }
    async verifyCode(body, res, session) {
        console.log(session.code);
        const user = await this.userService.findUser(body.id);
        if (!user) {
            throw new common_1.BadRequestException();
        }
        const code = session.code;
        if (code === body.code) {
            const refreshToken = await this.authService.generateRefreshToken(user.id);
            res.cookie("refresh", refreshToken, {
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 7,
                secure: true,
                sameSite: "strict",
                path: "/api/v1/auth/token/refresh",
            });
            const accessToken = await this.authService.generateAccessToken(user);
            res.json({ accessToken: accessToken });
        }
    }
    async refreshToken(req) {
        const user = await this.userService.findUser(req.user.id);
        if (!user) {
            throw new common_1.BadRequestException();
        }
        const accessToken = await this.authService.generateAccessToken(user);
        return { accessToken: accessToken };
    }
    async verifyTwoFactorAuth(body, req) {
        return this.authService.verifyTwoFactorAuth(body, req);
    }
    async verifyVerificationCode(body, req) {
        const { code } = body;
        const storedVerificationCode = req.session.verificationCode;
        return this.authService.verifyVerificationCode(code, storedVerificationCode, req.session.user.id, req.session.user.email);
    }
};
__decorate([
    (0, common_1.Get)("/social/redirect/forty-two"),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "redirectFortytwo", null);
__decorate([
    (0, common_1.Get)("/social/callback/forty-two"),
    (0, common_1.UseGuards)(oauth_guard_1.OauthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "callbackFortytwo", null);
__decorate([
    (0, common_1.Post)("/verifyCode"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyCode", null);
__decorate([
    (0, common_1.Get)("/token/refresh"),
    (0, common_1.UseGuards)(jwt_refresh_guard_1.JwtRefreshGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)("/isTwoFactor"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyTwoFactorAuth", null);
__decorate([
    (0, common_1.Post)("/verifyVerificationCode"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyVerificationCode", null);
AuthController = __decorate([
    (0, common_1.Controller)("api/v1/auth"),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        user_service_1.UserService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map
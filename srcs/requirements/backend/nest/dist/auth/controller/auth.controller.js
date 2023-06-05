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
const auth_service_1 = require("../service/auth.service");
const user_service_1 = require("../../user/service/user.service");
const jwt_refresh_guard_1 = require("../guard/jwt-refresh.guard");
const ft_guard_1 = require("../guard/ft.guard");
const two_factor_auth_request_1 = require("../dto/two-factor-auth-request");
const typeorm_1 = require("typeorm");
const callback_response_1 = require("../dto/callback-response");
const access_token_response_1 = require("../dto/access-token-response");
let AuthController = class AuthController {
    constructor(authService, userService) {
        this.authService = authService;
        this.userService = userService;
    }
    redirectFortytwo(res) {
        res
            .status(common_1.HttpStatus.FOUND)
            .redirect(`https://api.intra.42.fr/oauth/authorize?client_id=${process.env.OAUTH_42_CLIENT_ID}&redirect_uri=https://${process.env.HOST_NAME}/auth/social/callback/forty-two&response_type=code&scope=public`);
    }
    async callbackFortytwo(req, res) {
        let user;
        try {
            user = await this.userService.findOne(req.user.id);
            res.status(common_1.HttpStatus.OK);
            if (user.is2FA) {
                this.authService.send2FACode(user.id, user.email);
                return new callback_response_1.CallbackResponse(true, user.id);
            }
        }
        catch (e) {
            if (!(e instanceof typeorm_1.EntityNotFoundError)) {
                throw e;
            }
            user = await this.userService.insert(req.user);
        }
        res.cookie("refresh", await this.authService.genRefreshToken(user.id), {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
            secure: true,
            sameSite: "strict",
            path: "/api/v1/auth/token/refresh",
        });
        return new callback_response_1.CallbackResponse(false, user.id, await this.authService.genAccessToken(user.id));
    }
    async TwoFactorAuthentication(body, res) {
        await this.authService.validate2FACode(body.id, body.code);
        res.cookie("refresh", await this.authService.genRefreshToken(body.id), {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
            secure: true,
            sameSite: "strict",
            path: "/api/v1/auth/token/refresh",
        });
        return new access_token_response_1.AccessTokenResponse(await this.authService.genAccessToken(body.id));
    }
    async refreshToken(req) {
        return new access_token_response_1.AccessTokenResponse(await this.authService.genAccessToken(req.user.id));
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
    (0, common_1.Post)("/social/callback/forty-two"),
    (0, common_1.UseGuards)(ft_guard_1.FtGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "callbackFortytwo", null);
__decorate([
    (0, common_1.Post)("/2fa"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [two_factor_auth_request_1.TwoFactorAuthRequest, Object]),
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
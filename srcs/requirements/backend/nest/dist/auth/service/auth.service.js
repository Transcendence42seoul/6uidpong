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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const nodemailer = require("nodemailer");
const cache_manager_1 = require("@nestjs/cache-manager");
const cache_manager_2 = require("cache-manager");
let AuthService = class AuthService {
    constructor(jwtService, cacheManager) {
        this.jwtService = jwtService;
        this.cacheManager = cacheManager;
    }
    async genAccessToken(userId) {
        const payload = {
            id: userId,
        };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_ACCESS_SECRET_KEY,
            expiresIn: "20m",
        });
        return accessToken;
    }
    async genRefreshToken(userId) {
        const payload = {
            id: userId,
        };
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET_KEY,
            expiresIn: "7d",
        });
        return refreshToken;
    }
    async send2FACode(userId, email) {
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            service: "gmail",
            auth: {
                user: emailUser,
                pass: emailPass,
            },
        });
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const mailOptions = {
            from: "6uidpong@42seoul.kr",
            to: email,
            subject: "Verification Code",
            text: `Your verification code is: ${code}`,
        };
        await transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error(error);
                throw new common_1.InternalServerErrorException("mail send failed");
            }
        });
        await this.cacheManager.set(userId.toString(), code, 300000);
    }
    async validate2FACode(userId, code) {
        if ((await this.cacheManager.get(userId.toString())) != code) {
            throw new common_1.UnauthorizedException("invalid 2fa code");
        }
        await this.cacheManager.del(userId.toString());
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, typeof (_b = typeof cache_manager_2.Cache !== "undefined" && cache_manager_2.Cache) === "function" ? _b : Object])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map
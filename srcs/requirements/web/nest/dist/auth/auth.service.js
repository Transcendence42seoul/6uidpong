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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const nodemailer = require("nodemailer");
const user_entity_1 = require("../user/user.entity");
let AuthService = class AuthService {
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }
    async generateAccessToken(user) {
        const payload = {
            id: user.id,
            nickname: user.nickname,
            isTwoFactor: user.isTwoFactor,
        };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_ACCESS_SECRET_KEY,
            expiresIn: "2m",
        });
        return accessToken;
    }
    async generateRefreshToken(id) {
        const payload = {
            id: id,
        };
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET_KEY,
            expiresIn: "7d",
        });
        return refreshToken;
    }
    async verifyTwoFactorAuth(body, req) {
        try {
            const { id, email } = body;
            req.session.user = { id, email };
            const verificationCode = this.generateVerificationCode();
            req.session.verificationCode = verificationCode;
            await this.sendVerificationCodeByEmail(req.session.user.email, req.session.verificationCode);
        }
        catch (error) {
            throw new Error("Failed to verify two-factor authentication.");
        }
        return true;
    }
    async verifyVerificationCode(code, storedVerificationCode, id, email) {
        try {
            const user = await this.userRepository.findOne({ where: { id: id } });
            if (code === storedVerificationCode) {
                await this.userRepository.update(user.id, {
                    isTwoFactor: true,
                    email: email,
                });
                return true;
            }
            else {
                throw new Error("Failed to verify verification code.");
            }
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }
    generateVerificationCode() {
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        return verificationCode;
    }
    async sendVerificationCodeByEmail(email, verificationCode) {
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
        const mailOptions = {
            from: "6uidpong@42seoul.kr",
            to: email,
            subject: "Verification Code",
            text: `Your verification code is: ${verificationCode}`,
        };
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
            }
            else {
                console.log("Email sent: " + info.response);
            }
        });
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map
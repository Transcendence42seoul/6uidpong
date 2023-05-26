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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FtGuard = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let FtGuard = class FtGuard {
    constructor(httpService) {
        this.httpService = httpService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const code = request.body.code;
        if (typeof code === null) {
            throw new common_1.BadRequestException();
        }
        try {
            const accessToken = await this.receiveOauthAccessToken(code);
            const headers = { Authorization: `Bearer ${accessToken}` };
            const { data } = await (0, rxjs_1.lastValueFrom)(this.httpService.get("https://api.intra.42.fr/v2/me", {
                headers,
            }));
            request["user"] = data;
        }
        catch (_a) {
            throw new common_1.UnauthorizedException();
        }
        return true;
    }
    async receiveOauthAccessToken(code) {
        const headers = { "Content-Type": "application/json" };
        const body = {
            grant_type: "authorization_code",
            client_id: process.env.OAUTH_42_CLIENT_ID,
            client_secret: process.env.OAUTH_42_CLIENT_SECRET,
            code: code,
            redirect_uri: `https://${process.env.HOST_NAME}/auth/social/callback/forty-two`,
        };
        const { data } = await (0, rxjs_1.lastValueFrom)(this.httpService.post("https://api.intra.42.fr/oauth/token", body, {
            headers,
        }));
        return data.access_token;
    }
};
FtGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object])
], FtGuard);
exports.FtGuard = FtGuard;
//# sourceMappingURL=ft.guard.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const user_entity_1 = require("../../user/entity/user.entity");
const user_module_1 = require("../../user/module/user.module");
const auth_controller_1 = require("../controller/auth.controller");
const auth_service_1 = require("../service/auth.service");
const ft_guard_1 = require("../guard/ft.guard");
const jwt_access_guard_1 = require("../guard/jwt-access.guard");
const jwt_refresh_guard_1 = require("../guard/jwt-refresh.guard");
const permission_guard_1 = require("../guard/permission.guard");
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            jwt_1.JwtModule.register({
                global: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User]),
            axios_1.HttpModule,
            cache_manager_1.CacheModule.register(),
        ],
        providers: [
            auth_service_1.AuthService,
            jwt_access_guard_1.JwtAccessGuard,
            jwt_refresh_guard_1.JwtRefreshGuard,
            ft_guard_1.FtGuard,
            permission_guard_1.PermissionGuard,
        ],
        exports: [auth_service_1.AuthService],
        controllers: [auth_controller_1.AuthController],
    })
], AuthModule);
exports.AuthModule = AuthModule;
//# sourceMappingURL=auth.module.js.map
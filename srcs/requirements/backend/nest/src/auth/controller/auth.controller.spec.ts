import { Test } from "@nestjs/testing";
import { User } from "src/user/entity/user.entity";
import { UserService } from "src/user/service/user.service";
import { AuthService } from "../service/auth.service";
import { AuthController } from "./auth.controller";
import { FtGuard } from "../guard/ft.guard";
import { JwtRefreshGuard } from "../guard/jwt-refresh.guard";
import { HttpStatus, UnauthorizedException } from "@nestjs/common";

jest.mock("../guard/jwt-refresh.guard");
jest.mock("../guard/ft.guard");

describe("AuthController", () => {
  let authController: AuthController;
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            send2FACode: jest.fn(),
            genAccessToken: jest.fn().mockResolvedValue("test_access_token"),
            genRefreshToken: jest.fn().mockResolvedValue("test_refresh_token"),
            validate2FACode: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOneOrFail: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: FtGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: JwtRefreshGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
    userService = moduleRef.get<UserService>(UserService);
  });
  describe("redirectFortytwo", () => {
    it("should redirect to 42 login page", () => {
      // Arrange
      const res: any = {
        status: jest.fn().mockReturnThis(),
        redirect: jest.fn(),
      };

      // Act
      authController.redirectFortytwo(res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(HttpStatus.FOUND);
      expect(res.redirect).toHaveBeenCalledWith(
        `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.OAUTH_42_CLIENT_ID}&redirect_uri=https://${process.env.HOST_NAME}/auth/social/callback/forty-two&response_type=code&scope=public`
      );
    });
  });
  describe("callbackFortytwo", () => {
    it("should return is2FA: true, id: user.id, accessToken: null", async () => {
      // Arrange
      const user = new User();
      user.id = 110731;
      user.email = "mock";
      user.is2FA = true;

      jest.spyOn(userService, "findOneOrFail").mockResolvedValue(user);

      const req = { user: { id: 110731 } };
      const res: any = {
        status: jest.fn().mockReturnThis(),
      };

      // Act
      const result = await authController.callbackFortytwo(req, res);

      // Assert
      expect(result).toStrictEqual({
        is2FA: true,
        id: user.id,
        accessToken: null,
      });
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });
    it("should return is2FA: false, id: user.id, accessToken: accessToken", async () => {
      // Arrange
      const user = new User();
      user.id = 110731;
      user.is2FA = false;

      jest.spyOn(userService, "findOneOrFail").mockResolvedValue(user);

      const req = { user: { id: 110731 } };
      const res: any = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      // Act
      const result = await authController.callbackFortytwo(req, res);

      // Assert
      expect(result).toStrictEqual({
        is2FA: false,
        id: user.id,
        accessToken: "test_access_token",
      });
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.cookie).toHaveBeenCalledWith("refresh", "test_refresh_token", {
        httpOnly: true,
        maxAge: 604800,
        secure: true,
        sameSite: "strict",
        path: "/api/v1/auth/token/refresh",
      });
    });
    it("should create a new user if the user does not exist", async () => {
      // Arrange
      const user = new User();
      user.id = 110731;

      jest.spyOn(userService, "save").mockResolvedValue(user);
      jest.spyOn(userService, "findOneOrFail").mockResolvedValue(null);

      const req = { user: { id: 110731 } };
      const res: any = {
        status: jest.fn().mockReturnThis(),
        setHeader: jest.fn(),
        cookie: jest.fn(),
      };

      // Act
      const result = await authController.callbackFortytwo(req, res);

      // Assert
      expect(result).toStrictEqual({
        is2FA: false,
        id: user.id,
        accessToken: "test_access_token",
      });
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.setHeader).toHaveBeenCalledWith(
        "Location",
        `/api/v1/users/${user.id}`
      );
      expect(res.cookie).toHaveBeenCalledWith("refresh", "test_refresh_token", {
        httpOnly: true,
        maxAge: 604800,
        secure: true,
        sameSite: "strict",
        path: "/api/v1/auth/token/refresh",
      });
    });
  });
  describe("TwoFactorAuthentication", () => {
    it("should throw an UnauthorizedException if the code is invalid", async () => {
      // Arrange
      const TwoFactorAuthRequest = {
        id: 110731,
        code: "123456",
      };
      const res: any = {};

      jest.spyOn(authService, "validate2FACode");

      // Assert
      await expect(
        authController.TwoFactorAuthentication(TwoFactorAuthRequest, res)
      ).rejects.toThrow(UnauthorizedException);
    });
    it("should return an access token if the 2FA code is valid", async () => {
      // Arrange
      const TwoFactorAuthRequest = {
        id: 110731,
        code: "123456",
      };
      const res: any = {
        cookie: jest.fn(),
      };

      jest.spyOn(authService, "validate2FACode");

      // Act
      const result = await authController.TwoFactorAuthentication(
        TwoFactorAuthRequest,
        res
      );

      // Assert
      expect(result).toStrictEqual({ accessToken: "test_access_token" });
      expect(res.cookie).toHaveBeenCalledWith("refresh", "test_refresh_token", {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
        secure: true,
        sameSite: "strict",
        path: "/api/v1/auth/token/refresh",
      });
    });
  });
  describe("refreshToken", () => {
    it("should return access token", async () => {
      // Arrange
      const req = { user: { id: 110731 } };

      // Act
      const result = await authController.refreshToken(req);

      // Assert
      expect(result).toStrictEqual({ accessToken: "test_access_token" });
      expect(authService.genAccessToken).toHaveBeenCalledWith(req.user.id);
    });
  });
});

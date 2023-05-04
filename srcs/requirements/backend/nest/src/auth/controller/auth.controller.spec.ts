import { Test } from "@nestjs/testing";
import { UserEntity } from "src/user/entity/user.entity";
import { UserService } from "src/user/service/user.service";
import { AuthService } from "../service/auth.service";
import { AuthController } from "./auth.controller";
import { FtGuard } from "../guard/ft.guard";
import { JwtRefreshGuard } from "../guard/jwt-refresh.guard";
import { HttpStatus } from "@nestjs/common";

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
            sendCodeByEmail: jest.fn(),
            generateAccessToken: jest
              .fn()
              .mockResolvedValue("test_access_token"),
            generateRefreshToken: jest
              .fn()
              .mockResolvedValue("test_refresh_token"),
          },
        },
        {
          provide: UserService,
          useValue: {
            findUserById: jest.fn(),
            createUser: jest.fn(),
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
  describe("callbackFortytwo", () => {
    it("should return is2FA: true, id: user.id, accessToken: null", async () => {
      const user = new UserEntity();
      user.id = 110731;
      user.email = "none";
      user.is2FA = true;

      jest.spyOn(userService, "findUserById").mockResolvedValue(user);

      const req = { user: { id: 110731 } };
      const res: any = {
        status: jest.fn().mockReturnThis(),
      };

      const result = await authController.callbackFortytwo(req, res);
      expect(result).toEqual({ is2FA: true, id: user.id, accessToken: null });
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });
    it("should return is2FA: false, id: user.id, accessToken: accessToken", async () => {
      const user = new UserEntity();
      user.id = 110731;
      user.email = "none";
      user.is2FA = false;

      jest.spyOn(userService, "findUserById").mockResolvedValue(user);

      const req = { user: { id: user.id } };
      const res: any = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      const result = await authController.callbackFortytwo(req, res);
      expect(result).toEqual({
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
      const user = new UserEntity();
      user.id = 110731;
      user.email = "none";
      user.is2FA = false;
      jest.spyOn(userService, "createUser").mockResolvedValue(user);
      jest.spyOn(userService, "findUserById").mockResolvedValue(null);

      const req = { user: { id: user.id } };
      const res: any = {
        status: jest.fn().mockReturnThis(),
        setHeader: jest.fn(),
        cookie: jest.fn(),
      };

      const result = await authController.callbackFortytwo(req, res);
      expect(result).toEqual({
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
});

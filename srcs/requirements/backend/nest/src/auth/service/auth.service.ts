import {
  Injectable,
  Inject,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as nodemailer from "nodemailer";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache
  ) {}

  async genAccessToken(userId: number): Promise<string> {
    const payload: Object = {
      id: userId,
    };
    const accessToken: string = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET_KEY,
      expiresIn: "2m",
    });

    return accessToken;
  }

  async genRefreshToken(userId: number): Promise<string> {
    const payload: Object = {
      id: userId,
    };
    const refreshToken: string = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET_KEY,
      expiresIn: "7d",
    });

    return refreshToken;
  }

  async send2FACode(userId: number, email: string): Promise<void> {
    const emailUser: string = process.env.EMAIL_USER;
    const emailPass: string = process.env.EMAIL_PASS;

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

    const code: string = Math.floor(100000 + Math.random() * 900000).toString();

    const mailOptions: Object = {
      from: "6uidpong@42seoul.kr",
      to: email,
      subject: "Verification Code",
      text: `Your verification code is: ${code}`,
    };

    await transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error(error);
        throw new InternalServerErrorException("mail send failed.");
      }
    });

    await this.cacheManager.set(userId.toString(), code, 300000);
  }

  async validate2FACode(userId: number, code: string): Promise<void> {
    if ((await this.cacheManager.get(userId.toString())) != code) {
      throw new UnauthorizedException("invalid 2fa code.");
    }
    await this.cacheManager.del(userId.toString());
  }
}

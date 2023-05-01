import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserDto } from "src/user/dto/user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import * as nodemailer from "nodemailer";
import { UserEntity } from "../user/user.entity";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache
  ) {}

  async generateAccessToken(user: UserDto): Promise<string> {
    const payload = {
      id: user.id,
      nickname: user.nickname,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET_KEY,
      expiresIn: "2m",
    });
    return accessToken;
  }

  async generateRefreshToken(id: number): Promise<any> {
    const payload = {
      id: id,
    };
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET_KEY,
      expiresIn: "7d",
    });
    return refreshToken;
  }

  async verifyTwoFactorAuth(body: {
    id: number;
    email: string;
  }): Promise<boolean> {
    try {
      const { id, email } = body;
      const verificationCode = this.generateVerificationCode();
      await this.sendVerificationCodeByEmail(email, verificationCode);
      await this.cacheManager.set(
        id.toString(),
        verificationCode.toString(),
        300000
      );
      return true;
    } catch (error) {
      console.log(error);
      return false; // 인증 코드 전송 실패시 false 반환
    }
  }

  async verifyVerificationCode(body: {
    id: number;
    code: string;
    email: string;
  }): Promise<boolean> {
    try {
      const { id, code, email } = body;
      const user = await this.userRepository.findOne({ where: { id: id } });
      const storedVerificationCode = await this.cacheManager.get(
        user.id.toString()
      );
      if (code === storedVerificationCode) {
        await this.cacheManager.reset();
        // 변경된 이메일과 isTwoFactor값을 db에 저장
        await this.userRepository.update(user.id, {
          isTwoFactor: true,
          email: email,
        });
        return true;
      } else return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public generateVerificationCode() {
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    return verificationCode;
  }

  public async sendVerificationCodeByEmail(
    email: string,
    verificationCode: string
  ): Promise<void> {
    // Nodemailer를 사용하여 이메일 전송 설정
    const emailUser: string = process.env.EMAIL_USER;
    const emailPass: string = process.env.EMAIL_PASS;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // SSL 사용
      service: "gmail",
      auth: {
        user: emailUser, // 발신자 이메일 주소
        pass: emailPass, // 발신자 이메일 비밀번호
      },
    });
    const mailOptions = {
      from: "6uidpong@42seoul.kr", // 발신자 이메일 주소
      to: email, // 수신자 이메일 주소
      subject: "Verification Code", // 이메일 제목
      text: `Your verification code is: ${verificationCode}`, // 이메일 본문
    };

    // 이메일 전송
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }
}

import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserDto } from "src/user/dto/user.dto";
import * as nodemailer from "nodemailer";

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

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

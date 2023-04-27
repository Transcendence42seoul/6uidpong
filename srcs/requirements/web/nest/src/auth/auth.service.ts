import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserDto } from "src/user/dto/user.dto";
import { InjectConnection , InjectRepository } from "@nestjs/typeorm";
import { Connection, Repository } from "typeorm";
import * as nodemailer from 'nodemailer';
import { UserEntity } from "../user/user.entity";
import { VerificationDto } from "./dto/verification.dto";

@Injectable()
export class AuthService {
  private verificationDto: VerificationDto;
  constructor(
    @InjectRepository(UserEntity)
      private readonly userRepository: Repository<UserEntity>,
      @InjectConnection()
      private readonly connection: Connection,
    private readonly jwtService: JwtService,
  ) {}

  async generateAccessToken(user: UserDto): Promise<any> {
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

  async verifyTwoFactorAuth(body: {id:number, email:string}, req: any): Promise<boolean> {
    try {
      const {id, email} = body;
      req.session.user = {id, email};
      const verificationCode = this.generateVerificationCode();
      req.session.verificationCode = verificationCode;
      await this.sendVerificationCodeByEmail(req.session.user.email, req.session.verificationCode);
    } catch (error) {
      throw new Error('Failed to verify two-factor authentication.'); // 에러 처리
    }
    return true;
  }

  async verifyVerificationCode( code: string, storedVerificationCode: string, id: number, email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id:id } });
    if (code === storedVerificationCode) {
      // 변경된 이메일과 isTwoFactor값을 db에 저장
      await this.userRepository.update(user.id, {isTwoFactor: true, email: email});
      return true;
    } else {
      throw new Error('Failed to verify verification code.');
    } 
  }

  private generateVerificationCode() {
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    return verificationCode;
  }

  private async sendVerificationCodeByEmail(email: string, verificationCode: string): Promise<void> {
    // Nodemailer를 사용하여 이메일 전송 설정
    const emailUser:string = process.env.EMAIL_USER;
    const emailPass:string = process.env.EMAIL_PASS;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // SSL 사용
      service: 'gmail',
      auth: {
        user: emailUser, // 발신자 이메일 주소
        pass: emailPass, // 발신자 이메일 비밀번호
      },
    });
    const mailOptions = {
      from: "6uidpong@42seoul.kr", // 발신자 이메일 주소
      to: email, // 수신자 이메일 주소
      subject: 'Verification Code', // 이메일 제목
      text: `Your verification code is: ${verificationCode}`, // 이메일 본문
    };

    // 이메일 전송
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      }
      else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
}
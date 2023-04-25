import { HttpService } from "@nestjs/axios";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { lastValueFrom } from "rxjs";
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
    private readonly httpService: HttpService
  ) {}

  async receiveOauthAccessToken(code: string): Promise<string> {
    const headers = { "Content-Type": "application/json" };
    const body = {
      grant_type: "authorization_code",
      client_id: process.env.OAUTH_42_CLIENT_ID,
      client_secret: process.env.OAUTH_42_CLIENT_SECRET,
      code: code,
      redirect_uri: `https://${process.env.HOST_NAME}/auth/social/callback/forty-two`,
    };
    try {
      const { data } = await lastValueFrom(
        this.httpService.post("https://api.intra.42.fr/oauth/token", body, {
          headers,
        })
      );
      return data.access_token;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async receiveOAuthProfile(code: string): Promise<any> {
    const accessToken = await this.receiveOauthAccessToken(code);
    const headers = { Authorization: `Bearer ${accessToken}` };
    const { data } = await lastValueFrom(
      this.httpService.get("https://api.intra.42.fr/v2/me", {
        headers,
      })
    );
    return {id: data.id, email: data.email, profileImage: data.image.link};
  }

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

  async verifyTwoFactorAuth(email: string): Promise<boolean> {
    try {
      const userRepository = this.connection.getRepository(UserEntity); // this.connection으로 커넥션 주입
      const user = await userRepository.findOne({ where: { email:email } });

      console.log(user.email + " " + email);
      if (user) {
        const verificationCode = this.generateVerificationCode(); // 이메일로 보낼 인증 코드 생성
        await this.sendVerificationCodeByEmail(email, verificationCode); // 이메일로 인증 코드 전송
  
        this.verificationDto = new VerificationDto(); // verificationDto 초기화 (필요 없을 수도 있음)
        this.verificationDto.code = verificationCode;
        this.verificationDto.email = user.email;
      }
      else {
        throw new Error("Failed to verify two-factor authentication.");
      }
    } catch (error) {
      throw new Error('Failed to verify two-factor authentication.'); // 에러 처리
    }
    return true;
  }
    
  async verifyVerificationCode(email: string, code: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email: email } });
    if (user && this.verificationDto.code === code) {
      // 변경된 이메일과 isTwoFactor값을 db에 저장
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
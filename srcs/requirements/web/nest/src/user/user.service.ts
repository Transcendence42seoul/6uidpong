import { Injectable } from "@nestjs/common";
import { InjectConnection , InjectRepository } from "@nestjs/typeorm";
import { Connection, Repository } from "typeorm";
import * as nodemailer from 'nodemailer';
import { CreateUserDto } from "./dto/create-user.dto";
import { UserEntity } from "./user.entity";
import { VerificationDto } from "./dto/verification.dto";

@Injectable()
export class UserService {
  private verificationDto: VerificationDto;
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async findUser(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const user = await this.userRepository.save(createUserDto.toEntity());
    return user;
  }

  async verifyTwoFactorAuth(email: string, isTwoFactor: boolean): Promise<UserEntity> {
    try {
      const userRepository = this.connection.getRepository(UserEntity); // this.connection으로 커넥션 주입
      const user = await userRepository.findOne({ where: { email: email } });
      if (user) {
        const verificationCode = this.generateVerificationCode(); // 이메일로 보낼 인증 코드 생성
        await this.sendVerificationCodeByEmail(email, verificationCode); // 이메일로 인증 코드 전송
  
        this.verificationDto = new VerificationDto(); // verificationDto 초기화 (필요 없을 수도 있음)
        this.verificationDto.code = verificationCode;
        this.verificationDto.email = user.email;
      }
      return user; // 변경된 엔티티 객체를 반환
    } catch (error) {
      throw new Error('Failed to verify two-factor authentication.'); // 에러 처리
    }
  }
    
  async verifyVerificationCode(email: string, code: string): Promise<boolean> {
    // 여기에 인증 코드 검증 로직 추가
    const user = await this.userRepository.findOne({ where: { email: email } });

    if (user && this.verificationDto.code === code) {
      return true;
    } else {
      return false;
    }
  }

  private generateVerificationCode(): string {
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    return verificationCode;
  }

  private async sendVerificationCodeByEmail(email: string, verificationCode: string): Promise<void> {
    // Nodemailer를 사용하여 이메일 전송 설정
    const emailUser:string = process.env.EMAIL_USER;
    const emailPass:string = process.env.EMAIL_PASS;
    console.log(emailUser + " " + emailPass);

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

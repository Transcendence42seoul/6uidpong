import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, getManager } from "typeorm";
import * as nodemailer from 'nodemailer';
import { CreateUserDto } from "./dto/create-user.dto";
import { UserEntity } from "./user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
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
    const userRepository = getManager().getRepository(UserEntity);
    const user = await userRepository.findOne({ where: { email: email } });

    if (user) {
      const verificationCode = this.generateVerificationCode(); // 이메일로 보낼 인증 코드 생성
      await this.sendVerificationCodeByEmail(email, verificationCode); // 이메일로 인증 코드 전송

      // 사용자가 이메일로 전송된 인증 코드를 입력하고 검증하는 로직
      const isValidCode = await this.verifyVerificationCode(email, verificationCode); // 이메일로 받은 인증 코드 검증

      if (isValidCode) {
        user.isTwoFactor = true; // 2단계 인증이 성공적으로 검증되었다면, 사용자 엔티티 객체의 isTwoFactorVerified 속성을 true로 변경
        await this.userRepository.save(user); // 변경 내용을 데이터베이스에 저장
      }
    }
    return user; // 변경된 엔티티 객체를 반환
  }
    
  async verifyVerificationCode(email: string, code: string): Promise<boolean> {
    // 여기에 인증 코드 검증 로직 추가
    const user = await this.userRepository.findOne({ where: { email: email } });
    if (user && user.verificationCode === code) {
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
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: '6uidpong@42seoul.com', // 발신자 이메일 주소
        pass: 'yoson', // 발신자 이메일 비밀번호
      },
    });

    // 이메일 전송
    await transporter.sendMail({
      from: '6uidpong@42seoul.com', // 발신자 이메일 주소
      to: email, // 수신자 이메일 주소
      subject: 'Verification Code', // 이메일 제목
      text: `Your verification code is: ${verificationCode}`, // 이메일 본문
    });
    console.log(`Verification code sent to ${email}`); // 성공적으로 전송되었을 경우 로그 출력
  }
}

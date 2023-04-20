import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallBack } from "passport-42";
import { CreateUserDto } from "src/user/dto/create-user.dto";

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, "42") {
  constructor() {
    super({
      clientID: process.env.OAUTH_42_CLIENT_ID,
      clientSecret: process.env.OAUTH_42_CLIENT_SECRET,
      callbackURL: `https://${process.env.HOST_NAME}/api/v1/auth/social/callback/forty-two`,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallBack
  ): Promise<void> {
    const user: CreateUserDto = {
      token_id: profile.id,
      email: profile.emails[0].value,
      profile_image: profile.profileUrl,
    };
    done(null, user);
  }
}

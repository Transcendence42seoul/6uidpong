import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallBack } from "passport-42";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import { UserService } from "src/user/user.service";

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, "42") {
  constructor(private readonly userService: UserService) {
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
    let user = await this.userService.findUser(profile.id);
    if (!user) {
      user = await this.userService.createUser(
        new CreateUserDto(
          profile.id,
          profile.emails[0].value,
          profile._json.image.link
        )
      );
    }
    done(null, user);
  }
}

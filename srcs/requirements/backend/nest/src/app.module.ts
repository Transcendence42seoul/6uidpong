import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/module/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeORMConfig } from "./configs/typeorm.config";
import { UserModule } from "./user/module/user.module";
import { ChatModule } from "./chat/module/chat.module";

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    AuthModule,
    UserModule,
    ChatModule,
  ],
})
export class AppModule {}

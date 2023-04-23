import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeORMConfig } from "./configs/typeorm.config";
import { UserModule } from "./user/user.module";

@Module({
  imports: [TypeOrmModule.forRoot(typeORMConfig), AuthModule, UserModule],
})
export class AppModule {}
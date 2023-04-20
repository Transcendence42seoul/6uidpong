import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeORMConfig } from "./configs/typeorm.config";

@Module({
  imports: [TypeOrmModule.forRoot(typeORMConfig), AuthModule],
})
export class AppModule {}

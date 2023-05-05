import { HttpException, HttpStatus, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 유효하지 않은 속성 제거
      forbidNonWhitelisted: true, // 허용되지 않은 속성이 포함된 요청을 거부
      transform: true, // 요청 데이터 자동 변환
      exceptionFactory: (errors) => {
        return new HttpException(
          { message: "Validation failed", errors: errors },
          HttpStatus.UNPROCESSABLE_ENTITY
        );
      },
    })
  );
  await app.listen(8080);
}
bootstrap();

import { Injectable, NestMiddleware } from '@nestjs/common';
import * as session from 'express-session';
import { Request, Response, NextFunction } from 'express';
import * as cookieParser from 'cookie-parser';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor() {}
    use(req: Request, res: Response, next: NextFunction) {
      const sessionMiddleware = session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    });

    sessionMiddleware(req, res, () => {
      next();
      });
    }
  }

import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { envSchema } from 'src/app/configs/env/env.config';
import { UserRole } from '../../users/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token, TokenDocument } from '../../tokens/schema/token.schema';
import type { Request } from 'express';

export interface JwtPayload {
  userId: string;
  role: UserRole | string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    @InjectModel(Token.name)
    private readonly tokenModel: Model<TokenDocument>,
  ) {
    const env = envSchema.parse(process.env);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.JWT_ACCESS_TOKEN_SECRET,
      passReqToCallback: true,
    });
  }

  /**
   * req: Request gốc, dùng để lấy raw JWT token
   * payload: dữ liệu đã được verify bởi passport-jwt (userId, role)
   */
  async validate(req: Request, payload: JwtPayload) {
    const authHeader = (req as any).headers?.authorization || '';
    const [, token] = authHeader.split(' ');

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    // Kiểm tra token có còn hợp lệ trong DB (chưa bị logout) hay không
    const tokenRecord = await this.tokenModel.findOne({
      userId: payload.userId,
      token,
      isDeleted: false,
    });

    if (!tokenRecord) {
      this.logger.warn(
        `JWT revoked or not found for user ${payload.userId}.`,
      );
      throw new UnauthorizedException('Token has been revoked');
    }

    this.logger.debug(`JwtStrategy validate OK: ${JSON.stringify(payload)}`);

    // Dữ liệu sẽ gắn vào req.user
    return {
      userId: payload.userId,
      role: payload.role,
    };
  }
}

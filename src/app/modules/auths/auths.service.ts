import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, ClientSession } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  User,
  UserDocument,
  UserStatus,
  UserRole,
  UserTypeAccount,
} from '../users/schema/user.schema';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { InvitationCodesService } from '../invitation-codes/invitation-codes.service';
import { HistoryInvitationsService } from '../history-invitations/history-invitations.service';
import { CreateInvitationCodeDto } from '../invitation-codes/dto/create-invitation-code.dto';
import { HistoryInvitationStatus } from '../history-invitations/dto/create-history-invitation.dto';
import {
  InvitationCode,
  InvitationCodeDocument,
  InvitationCodeType,
} from '../invitation-codes/schema/invitation-code.schema';
import { LoginAuthDto } from './dto/login-auth.dto';
import * as jwt from 'jsonwebtoken';
import { TokensService } from '../tokens/tokens.service';
import { sendEmail } from 'src/app/common/utils/mail.util';
import { randomInt, randomUUID } from 'crypto';
import { Token, TokenDocument } from '../tokens/schema/token.schema';
import {
  LogoutDeviceAuthDto,
} from './dto/logout-auth.dto';
import { OAuth2Client } from 'google-auth-library';
import { Secret, SignOptions } from 'jsonwebtoken';
import { envSchema } from 'src/app/configs/env/env.config';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResendVerificationEmailDto } from './dto/resend-verification-email.dto';
import { RedisService } from 'src/app/configs/redis/redis.service';
import { verifyEmailQueue } from 'src/app/jobs/queues/verify-email.queue';
import { initializeVerifyEmailWorker } from 'src/app/jobs/workers/verify-email.worker';

@Injectable()
export class AuthsService implements OnModuleInit {
  private readonly logger = new Logger(AuthsService.name);
  private readonly oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID as string,
  );

  /**
   * Generate a 6-digit verification code
   */
  private generateVerificationCode(): string {
    return String(randomInt(100000, 999999));
  }
  /**
   * Split verification code into individual digits for email template
   */
  private splitCodeToDigits(code: string): {
    digit1: string;
    digit2: string;
    digit3: string;
    digit4: string;
    digit5: string;
    digit6: string;
  } {
    const paddedCode = code.padStart(6, '0');
    return {
      digit1: paddedCode[0] || '0',
      digit2: paddedCode[1] || '0',
      digit3: paddedCode[2] || '0',
      digit4: paddedCode[3] || '0',
      digit5: paddedCode[4] || '0',
      digit6: paddedCode[5] || '0',
    };
  }

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(InvitationCode.name)
    private readonly inviteCodeModel: Model<InvitationCodeDocument>,

    private readonly tokensService: TokensService,
    private readonly invitationCodesService: InvitationCodesService,
    private readonly historyInvitationsService: HistoryInvitationsService,

    @InjectModel(Token.name)
    private readonly tokenModel: Model<TokenDocument>,

    @InjectConnection()
    private readonly connection: Connection,

    private readonly redisService: RedisService,
  ) { }

  async onModuleInit() {
    await initializeVerifyEmailWorker();
    this.logger.log('Verify email worker initialized');
  }


  async register(
    registerAuthDto: RegisterAuthDto,
    session?: ClientSession,
  ): Promise<Partial<User>> {
    if (this.connection.readyState !== 1) {
      throw new BadRequestException('Database not ready.');
    }

    const mongooseSession = session ?? (await this.connection.startSession());
    const isNewSession = !session;

    if (isNewSession) {
      mongooseSession.startTransaction();
    }

    try {
      const existingUser = await this.userModel
        .findOne({
          $or: [
            { email: registerAuthDto.email },
            { username: registerAuthDto.username },
          ],
        })
        .session(mongooseSession);

      if (existingUser) {
        throw new ConflictException('Email or username already exists.');
      }

      // invite code logic
      let invitedBy: string | undefined;

      if (
        registerAuthDto.inviteCode &&
        registerAuthDto.role === UserRole.STUDENT
      ) {
        const inviter = await this.inviteCodeModel
          .findOne({ code: registerAuthDto.inviteCode })
          .session(mongooseSession);

        if (!inviter) {
          throw new NotFoundException('Invalid invite code.');
        }

        const inviterUser = await this.userModel
          .findById(inviter.createdBy)
          .session(mongooseSession);

        if (!inviterUser) {
          throw new NotFoundException('Inviter does not exist.');
        }

        invitedBy = inviter._id.toString();

        await this.historyInvitationsService.createHistoryInvitation(
          {
            userId: inviterUser._id.toString(),
            code: inviter.code,
            invitedAt: new Date().toISOString(),
            status: HistoryInvitationStatus.ACCEPTED,
          },
          mongooseSession,
        );
      }

      const hashedPassword = await bcrypt.hash(registerAuthDto.password, 10);

      const user = new this.userModel({
        ...registerAuthDto,
        password: hashedPassword,
        status: UserStatus.ACTIVE,
        isVerify: false,
        invitedBy,
        codeVerify: this.generateVerificationCode(),
      });

      const savedUser = await user.save({ session: mongooseSession });

      if (isNewSession) {
        await mongooseSession.commitTransaction();
        mongooseSession.endSession();
      }

      // AFTER COMMIT
      await verifyEmailQueue.add('verify-email', {
        email: savedUser.email,
        codeDigits: this.splitCodeToDigits(savedUser.codeVerify),
        fullname: savedUser.fullname,
        username: savedUser.username,
        year: new Date().getFullYear(),
      });

      const obj = savedUser.toObject();
      delete (obj as any).password;
      return obj;
    } catch (error) {
      if (isNewSession) {
        await mongooseSession.abortTransaction();
        mongooseSession.endSession();
      }
      throw error;
    }
  }


  async login(loginAuthDto: LoginAuthDto, session?: ClientSession) {
    if (this.connection.readyState !== 1) {
      throw new BadRequestException('Database not ready.');
    }

    const mongooseSession = session ?? (await this.connection.startSession());
    const isNewSession = !session;

    if (isNewSession) {
      mongooseSession.startTransaction();
    }

    const env = envSchema.parse(process.env);
    try {
      const user = await this.userModel.findOne({
        $or: [{ email: loginAuthDto.email }, { username: loginAuthDto.email }],
      }).session(mongooseSession);

      if (!user) throw new NotFoundException('User not found.');

      if (!user.isVerify) {
        throw new BadRequestException('User not verified.');
      }

      const valid = await bcrypt.compare(loginAuthDto.password, user.password);
      if (!valid) throw new BadRequestException('Invalid password.');

      // Các giá trị này đã được validate qua envSchema, không cần fallback mặc định
      const accessSecret = env.JWT_ACCESS_TOKEN_SECRET;
      const refreshSecret = env.JWT_REFRESH_TOKEN_SECRET;
      const accessExpiresIn = env.JWT_ACCESS_TOKEN_EXPIRATION;
      const refreshExpiresIn = env.JWT_REFRESH_TOKEN_EXPIRATION;

      const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        accessSecret,
        { expiresIn: accessExpiresIn } as SignOptions,
      );

      const refreshToken = jwt.sign(
        { userId: user._id, role: user.role },
        refreshSecret,
        { expiresIn: refreshExpiresIn } as SignOptions,
      );

      // Tạo token nếu chưa tồn tại
      await this.tokenModel.findOneAndUpdate(
        {
          userId: user._id.toString(),
          deviceId: loginAuthDto.deviceId,
        },
        {
          $set: {
            token: accessToken,
            deviceId: loginAuthDto.deviceId,
          },
        },
        { upsert: true },
      ).session(mongooseSession);

      const obj = user.toObject();
      delete (obj as any).password;

      if (isNewSession) {
        await mongooseSession.commitTransaction();
        await mongooseSession.endSession();
      }

      this.logger.log('Login successful:', {
        email: user.email,
        username: user.username,
        role: user.role,
        deviceId: loginAuthDto.deviceId,
      });

      return {
        ...obj,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      this.logger.error('Login failed:', error);
      if (isNewSession) {
        await mongooseSession.abortTransaction();
        await mongooseSession.endSession();
      }
      throw error;
    }

  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    try {
      const user = await this.userModel.findOne({ codeVerify: verifyEmailDto.codeVerify, email: verifyEmailDto.email });
      if (!user) throw new NotFoundException('Invalid code or email.');

      user.isVerify = true;
      await user.save();

      const obj = user.toObject();
      delete (obj as any).password;

      return { email: user.email, user: obj };
    } catch (error) {
      this.logger.error('Verify email failed:', error);
      throw error;
    }
  }

  async resendVerificationEmail(resendVerificationEmailDto: ResendVerificationEmailDto) {
    try {
      const user = await this.userModel.findOne({ email: resendVerificationEmailDto.email });
      if (!user) throw new NotFoundException('User not found.');

      const code = this.generateVerificationCode();
      user.codeVerify = code;
      await user.save();

      const codeDigits = this.splitCodeToDigits(code);
      sendEmail(user.email, 'Mã xác minh tài khoản HAPPY CAT', 'verify-email', {
        ...codeDigits,
        username: user.fullname || user.username || 'Bạn',
        year: new Date().getFullYear(),
        telegramUrl: 'https://t.me/oteacher',
        instagramUrl: 'https://instagram.com/oteacher',
        twitterUrl: 'https://twitter.com/oteacher',
        linkedinUrl: 'https://linkedin.com/company/oteacher',
      }).catch((e) => this.logger.error('Email send error:', e));

      return { email: user.email, codeVerify: code };
    } catch (error) {
      this.logger.error('Resend verification email failed:', error);
      throw error;
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const user = await this.userModel.findOne({ email: forgotPasswordDto.email });
      if (!user) throw new NotFoundException('User not found.');

      const code = this.generateVerificationCode();
      user.codeVerify = code;
      await user.save();

      const codeDigits = this.splitCodeToDigits(code);
      // Gửi email quên mật khẩu với template riêng
      sendEmail(user.email, 'Đặt lại mật khẩu HAPPY CAT', 'forgot-password', {
        ...codeDigits,
        username: user.fullname || user.username || 'Bạn',
        year: new Date().getFullYear(),
        telegramUrl: 'https://t.me/oteacher',
        instagramUrl: 'https://instagram.com/oteacher',
        twitterUrl: 'https://twitter.com/oteacher',
        linkedinUrl: 'https://linkedin.com/company/oteacher',
      }).catch((e) => this.logger.error('Email send error:', e));

      return { email: user.email, codeVerify: code };
    } catch (error) {
      this.logger.error('Forgot password failed:', error);
      throw error;
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const user = await this.userModel.findOne({ codeVerify: resetPasswordDto.codeVerify, email: resetPasswordDto.email });
      if (!user) throw new NotFoundException('User not found.');

      user.password = await bcrypt.hash(resetPasswordDto.password, 10);
      await user.save();

      // Gửi email thông báo đặt lại mật khẩu thành công
      sendEmail(
        user.email,
        'Mật khẩu HAPPY CAT của bạn đã được thay đổi',
        'reset-password',
        {
          username: user.fullname || user.username || 'Bạn',
          year: new Date().getFullYear(),
        },
      ).catch((e) => this.logger.error('Email send error:', e));
    } catch (error) {
      this.logger.error('Reset password failed:', error);
      throw error;
    }
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException('User not found.');

      const valid = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
      if (!valid) throw new BadRequestException('Invalid old password.');

      user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
      await user.save();

      return { message: 'Password changed successfully.' };
    } catch (error) {
      this.logger.error('Change password failed:', error);
      throw error;
    }
  }

  // ============================================================
  // LOGOUT
  // ============================================================
  async logoutAllDevices(userId: string) {
    try {
      const result = await this.tokenModel.updateMany(
        { userId: userId, isDeleted: false },
        { isDeleted: true },
      );

      if (result.modifiedCount === 0)
        throw new NotFoundException('No tokens found.');

      return { message: 'Logout successful.' };
    } catch (error) {
      this.logger.error('Logout all devices failed:', error);
      throw error;
    }
  }

  async logoutDevice(userId: string, logoutDeviceDto: LogoutDeviceAuthDto) {
    try {
      const result = await this.tokenModel.updateOne(
        { userId: userId, deviceId: logoutDeviceDto.deviceId, isDeleted: false },
        { isDeleted: true },
      );

      if (result.modifiedCount === 0)
        throw new NotFoundException('Token not found.');

      return { message: 'Logout successful.' };
    } catch (error) {
      this.logger.error('Logout device failed:', error);
      throw error;
    }
  }

  async logoutNotDevice(userId: string, logoutDeviceDto: LogoutDeviceAuthDto) {
    try {
      const result = await this.tokenModel.updateMany(
        { userId: userId, deviceId: { $ne: logoutDeviceDto.deviceId } },
        { isDeleted: true },
      );

      if (result.modifiedCount === 0)
        throw new NotFoundException('No tokens found.');

      return { message: 'Logout successful.' };
    } catch (error) {
      this.logger.error('Logout not device failed:', error);
      throw error;
    }
  }

  async verifyIdToken(credential: string) {
    try {
      const env = envSchema.parse(process.env);
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID as string,
      });
      const payload = ticket.getPayload();
      return {
        email: payload?.email || '',
        fullname: payload?.name || '',
        avatar: payload?.picture || '',
        provider: 'google',
        providerId: payload?.sub || '',
      };
    } catch (error) {
      this.logger.error('Verify id token failed:', error);
      throw error;
    }
  }

  async loginWithGoogle(googleUser: any) {
    try {
      const env = envSchema.parse(process.env);
      const { googleId, email, fullname, avatar } = googleUser;

      let user = await this.userModel.findOne({ googleId });

      const password = randomUUID().substring(0, 10);
      const hashedPassword = await bcrypt.hash(password, 10);

      if (!user) {
        user = await this.userModel.create({
          googleId,
          email,
          fullname,
          avatar,
          username: email.split('@')[0],
          password: hashedPassword,
          role: UserRole.STUDENT,
          status: UserStatus.ACTIVE,
          typeAccount: UserTypeAccount.GOOGLE,
        });
      }

      const accessToken = jwt.sign(
        { userId: user._id.toString(), role: user.role },
        env.JWT_ACCESS_TOKEN_SECRET as Secret,
        {
          expiresIn:
            env.JWT_ACCESS_TOKEN_EXPIRATION as SignOptions['expiresIn'],
        },
      );

      const refreshToken = jwt.sign(
        { userId: user._id.toString(), role: user.role },
        env.JWT_REFRESH_TOKEN_SECRET as Secret,
        {
          expiresIn:
            env.JWT_REFRESH_TOKEN_EXPIRATION as SignOptions['expiresIn'],
        },
      );

      return { accessToken, refreshToken, user };
    } catch (error) {
      this.logger.error('Login with google failed:', error);
      throw error;
    }
  }

  async googleOneTap(credential: string) {
    try {
      const env = envSchema.parse(process.env);
      const result = await this.verifyIdToken(credential);
      const user = await this.userModel.findOne({ email: result.email });
      if (!user) throw new NotFoundException('User not found.');
      const accessToken = jwt.sign(
        { userId: user._id.toString(), role: user.role as UserRole },
        env.JWT_ACCESS_TOKEN_SECRET as string,
        { expiresIn: '1h' },
      );
      const refreshToken = jwt.sign(
        { userId: user._id.toString(), role: user.role as UserRole },
        env.JWT_REFRESH_TOKEN_SECRET as string,
        { expiresIn: '7d' },
      );
      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error('Google one tap failed:', error);
      throw error;
    }
  }

  async loginWithFacebook(facebookUser: any) {
    try {
      const env = envSchema.parse(process.env);
      const { facebookId, email, fullname, avatar } = facebookUser;
      let user = await this.userModel.findOne({ facebookId });
      const password = randomUUID().substring(0, 10);
      const hashedPassword = await bcrypt.hash(password, 10);
      if (!user) {
        user = await this.userModel.create({
          facebookId,
          email,
          fullname,
          avatar,
          username: email.split('@')[0],
          password: hashedPassword,
          role: UserRole.STUDENT,
          status: UserStatus.ACTIVE,
          typeAccount: UserTypeAccount.FACEBOOK,
        });
      }
      const accessToken = jwt.sign(
        { userId: user._id.toString(), role: user.role },
        env.JWT_ACCESS_TOKEN_SECRET as Secret,
        {
          expiresIn:
            env.JWT_ACCESS_TOKEN_EXPIRATION as SignOptions['expiresIn'],
        },
      );
      const refreshToken = jwt.sign(
        { userId: user._id.toString(), role: user.role },
        env.JWT_REFRESH_TOKEN_SECRET as Secret,
        {
          expiresIn:
            env.JWT_REFRESH_TOKEN_EXPIRATION as SignOptions['expiresIn'],
        },
      );
      return { accessToken, refreshToken, user };
    } catch (error) {
      this.logger.error('Login with facebook failed:', error);
      throw error;
    }
  }

  async getProfile(userId: string): Promise<UserDocument> {
    try {
      const user = await this.userModel.findById(userId).select('-password');
      if (!user) throw new NotFoundException('User not found.');
      return user;
    } catch (error) {
      this.logger.error('Get profile failed:', error);
      throw error;
    }
  }
}

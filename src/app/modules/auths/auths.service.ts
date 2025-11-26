import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
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
import { randomUUID } from 'crypto';
import { Token, TokenDocument } from '../tokens/schema/token.schema';
import {
  LogoutAllDevicesAuthDto,
  LogoutDeviceAuthDto,
  LogoutNotDeviceAuthDto,
} from './dto/logout-auth.dto';
import { OAuth2Client } from 'google-auth-library';
import { Secret, SignOptions } from 'jsonwebtoken';
import { envSchema } from 'src/app/configs/env/env.config';

@Injectable()
export class AuthsService {
  private readonly logger = new Logger(AuthsService.name);
  private readonly oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID as string,
  );

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
  ) { }

  async register(registerAuthDto: RegisterAuthDto): Promise<Partial<User>> {
    // 1. Check duplicate
    const existingUser = await this.userModel.findOne({
      $or: [
        { email: registerAuthDto.email },
        { username: registerAuthDto.username },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Email or username already exists.');
    }

    // 2. Validate logic
    if (registerAuthDto.role === UserRole.STUDENT) {
      const missing: string[] = [];

      if (!registerAuthDto.inviteCode) {
        if (!registerAuthDto.school) missing.push('school');
        if (!registerAuthDto.className) missing.push('className');
        if (!registerAuthDto.teacher) missing.push('teacher');
        if (!registerAuthDto.parent) missing.push('parent');
      }

      if (missing.length) {
        throw new BadRequestException(
          `Students must provide: ${missing.join(', ')} or enter an invitation code.`,
        );
      }
    }

    if (registerAuthDto.role === UserRole.TEACHER) {
      if (!registerAuthDto.school) {
        throw new BadRequestException('Teachers must select their school.');
      }
    }

    // 3. Handle invite code
    let invitedBy: string | null = null;

    if (registerAuthDto.inviteCode && registerAuthDto.role === UserRole.STUDENT) {
      const inviter = await this.inviteCodeModel.findOne({
        code: registerAuthDto.inviteCode,
      });

      if (!inviter) throw new NotFoundException('Invalid invite code.');

      const inviterUser = await this.userModel.findById(inviter.createdBy);
      if (!inviterUser) throw new NotFoundException('Inviter does not exist.');
      if (inviterUser.role === UserRole.STUDENT)
        throw new BadRequestException('Students cannot invite.');

      invitedBy = inviter._id.toString();

      await this.historyInvitationsService.createHistoryInvitation({
        userId: inviterUser._id.toString(),
        code: inviter.code,
        invitedAt: new Date().toISOString(),
        status: HistoryInvitationStatus.ACCEPTED,
      });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(registerAuthDto.password, 10);

    // 5. Create user
    const savedUser = await this.userModel.create({
      ...registerAuthDto,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
      isVerify: false,
      invitedBy: invitedBy || undefined,
    });

    // 6. Create invitation code automatically
    if (
      [UserRole.PARENT, UserRole.TEACHER, UserRole.ADMIN].includes(
        savedUser.role as UserRole,
      )
    ) {
      await this.invitationCodesService.createInvitationCode({
        createdBy: savedUser._id.toString(),
        event: 'Invitation code for student registration',
        description: `Invitation code created by ${savedUser.username}`,
        type: InvitationCodeType.GROUP_JOIN,
        totalUses: 0,
        usesLeft: 100,
        startedAt: new Date().toISOString(),
      });
    }

    // 7. Email verify code
    savedUser.codeVerify = randomUUID().substring(0, 6);
    await savedUser.save();

    sendEmail(
      savedUser.email,
      'Mã xác minh tài khoản EnglishOne',
      'account-verification-email',
      {
        brandName: 'EnglishOne',
        userName: savedUser.username,
        verificationCode: savedUser.codeVerify,
        userEmail: savedUser.email,
        supportEmail: 'support@englishone.com',
        year: new Date().getFullYear(),
      },
    ).catch((e) => this.logger.error('Email send error:', e));

    const obj = savedUser.toObject();
    delete (obj as any).password;

    return obj;
  }

  // ============================================================
  // LOGIN
  // ============================================================

  async login(loginAuthDto: LoginAuthDto) {
    const env = envSchema.parse(process.env);
    try {
      const user = await this.userModel.findOne({
        $or: [{ email: loginAuthDto.email }, { username: loginAuthDto.email }],
      });

      if (!user) throw new NotFoundException('User not found.');

      const valid = await bcrypt.compare(loginAuthDto.password, user.password);
      if (!valid) throw new BadRequestException('Invalid password.');

      // ==========================
      // FIX SECRET + EXPIRESIN
      // ==========================
      const accessSecret =
        env.JWT_ACCESS_TOKEN_SECRET ?? 'access_token_secret';

      const refreshSecret =
        env.JWT_REFRESH_TOKEN_SECRET ?? 'refresh_token_secret';

      const accessExpiresIn =
        env.JWT_ACCESS_TOKEN_EXPIRATION ?? '1h';

      const refreshExpiresIn =
        env.JWT_REFRESH_TOKEN_EXPIRATION ?? '7d';

      // ==========================
      // GENERATE TOKENS (NO ERRORS)
      // ==========================
      const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        accessSecret,
        { expiresIn: accessExpiresIn } as SignOptions
      );

      const refreshToken = jwt.sign(
        { userId: user._id, role: user.role },
        refreshSecret,
        { expiresIn: refreshExpiresIn } as SignOptions
      );

      await this.tokensService.createToken({
        userId: user._id.toString(),
        token: accessToken,
        deviceId: loginAuthDto.deviceId,
        typeDevice: loginAuthDto.typeDevice,
        typeLogin: loginAuthDto.typeLogin,
      });

      const obj = user.toObject();
      delete (obj as any).password;

      return {
        ...obj,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      this.logger.error('Login failed:', error);
      throw error;
    }
  }



  // ============================================================
  // EMAIL VERIFY / RESEND / FORGOT / RESET / CHANGE PASSWORD
  // ============================================================
  async verifyEmail(codeVerify: string) {
    const user = await this.userModel.findOne({ codeVerify });
    if (!user) throw new NotFoundException('Invalid code.');

    user.isVerify = true;
    await user.save();

    const obj = user.toObject();
    delete (obj as any).password;

    return { email: user.email, user: obj };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found.');

    const code = randomUUID().substring(0, 6);
    user.codeVerify = code;
    await user.save();

    sendEmail(email, 'Xác minh email', 'account-verification-email', {
      brandName: 'Fit.io',
      userName: user.username,
      verificationCode: code,
      userEmail: user.email,
      supportEmail: 'support@fit.io.vn',
      year: new Date().getFullYear(),
    });

    return { email: user.email, codeVerify: code };
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found.');

    const code = randomUUID().substring(0, 6);
    user.codeVerify = code;
    await user.save();

    sendEmail(email, 'Đặt lại mật khẩu', 'reset-password-email', {
      brandName: 'Fit.io',
      userName: user.username,
      resetCode: code,
      supportEmail: 'support@fit.io.vn',
      year: new Date().getFullYear(),
    });

    return { email: user.email, codeVerify: code };
  }

  async resetPassword(codeVerify: string, password: string) {
    const user = await this.userModel.findOne({ codeVerify });
    if (!user) throw new NotFoundException('User not found.');

    user.password = await bcrypt.hash(password, 10);
    await user.save();
  }

  async changePassword(email: string, password: string, codeVerify: string) {
    const user = await this.userModel.findOne({ email, codeVerify });
    if (!user) throw new NotFoundException('User not found.');

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    const obj = user.toObject();
    delete (obj as any).password;

    return { user: obj };
  }

  // ============================================================
  // LOGOUT
  // ============================================================
  async logoutAllDevices(dto: LogoutAllDevicesAuthDto) {
    const r = await this.tokenModel.updateMany(
      { userId: dto.userId, isDeleted: false },
      { isDeleted: true },
    );

    if (r.modifiedCount === 0)
      throw new NotFoundException('No tokens found.');

    return { message: 'Logout successful.' };
  }

  async logoutDevice(dto: LogoutDeviceAuthDto) {
    const r = await this.tokenModel.updateOne(
      { userId: dto.userId, deviceId: dto.deviceId, isDeleted: false },
      { isDeleted: true },
    );

    if (r.modifiedCount === 0)
      throw new NotFoundException('Token not found.');

    return { message: 'Logout successful.' };
  }

  async logoutNotDevice(dto: LogoutNotDeviceAuthDto) {
    const r = await this.tokenModel.updateMany(
      { userId: dto.userId, deviceId: { $ne: dto.deviceId } },
      { isDeleted: true },
    );

    if (r.modifiedCount === 0)
      throw new NotFoundException('No tokens found.');

    return { message: 'Logout successful.' };
  }

  async verifyIdToken(credential: string) {
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
  }

  async loginWithGoogle(googleUser: any) {
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
      { expiresIn: env.JWT_ACCESS_TOKEN_EXPIRATION as SignOptions['expiresIn'] },
    );

    const refreshToken = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      env.JWT_REFRESH_TOKEN_SECRET as Secret,
      { expiresIn: env.JWT_REFRESH_TOKEN_EXPIRATION as SignOptions['expiresIn'] },
    );

    return { accessToken, refreshToken, user };
  }



  async googleOneTap(credential: string) {
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
  }

  async loginWithFacebook(facebookUser: any) {
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
      { expiresIn: env.JWT_ACCESS_TOKEN_EXPIRATION as SignOptions['expiresIn'] },
    );
    const refreshToken = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      env.JWT_REFRESH_TOKEN_SECRET as Secret,
      { expiresIn: env.JWT_REFRESH_TOKEN_EXPIRATION as SignOptions['expiresIn'] },
    );
    return { accessToken, refreshToken, user };
  }
}

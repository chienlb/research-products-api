import {
  Controller,
  Post,
  Body,
  Logger,
  Get,
  UseGuards,
  Req,
  Res,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { AuthsService } from './auths.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ok } from 'src/app/common/response/api-response';
import { LogoutDeviceAuthDto } from './dto/logout-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationEmailDto } from './dto/resend-verification-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import mongoose, { ClientSession } from 'mongoose';

@ApiTags('Auths')
@ApiBearerAuth()
@Controller('auths')
export class AuthsController {
  private readonly logger = new Logger(AuthsController.name);

  constructor(private readonly authsService: AuthsService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    description: 'Register a new user',
    type: RegisterAuthDto,
    examples: {
      normal: {
        summary: 'Example of a normal user',
        value: {
          fullname: 'Nguyen Van A',
          username: 'nguyenvana',
          email: 'nguyenvana@gmail.com',
          password: '123456',
          birthDate: '2015-09-15',
          role: 'parent',
          phone: '0912345678',
          gender: 'male',
          typeAccount: 'email',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() registerAuthDto: RegisterAuthDto) {
    try {
      const {
        fullname,
        username,
        email,
        password,
        birthDate,
        role,
        phone,
        gender,
        typeAccount,
      } = registerAuthDto;

      if (!fullname || !username || !email || !password) {
        throw new BadRequestException(
          'Missing required fields: fullname, username, email, or password',
        );
      }

      const result = await this.authsService.register({
        fullname,
        username,
        email,
        password,
        birthDate,
        role,
        phone,
        gender,
        typeAccount,
      });

      return ok(result, 'User registered successfully', 200);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }


  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({
    description: 'Login a user',
    type: LoginAuthDto,
    examples: {
      normal: {
        summary: 'Example of a normal user',
        value: {
          email: 'nguyenvana@example.com',
          password: '123456',
          deviceId: '1234567890',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async login(@Body() loginAuthDto: LoginAuthDto) {
    try {
      const result = await this.authsService.login(loginAuthDto);
      return ok(result, 'User logged in successfully', 200);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email' })
  @ApiBody({
    description: 'Verify email',
    type: String,
    examples: {
      normal: {
        summary: 'Example of a normal user',
        value: {
          codeVerify: '123456',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    const result = await this.authsService.verifyEmail(verifyEmailDto);
    return ok(result, 'Email verified successfully', 200);
  }

  @Post('resend-verification-email')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiBody({
    description: 'Resend verification email',
    type: String,
    examples: {
      normal: {
        summary: 'Example of a normal user',
        value: {
          email: 'nguyenvana@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email resent successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async resendVerificationEmail(
    @Body() resendVerificationEmailDto: ResendVerificationEmailDto,
  ) {
    const result = await this.authsService.resendVerificationEmail(
      resendVerificationEmailDto,
    );
    return ok(result, 'Verification email resent successfully', 200);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Forgot password' })
  @ApiBody({
    description: 'Forgot password',
    type: String,
    examples: {
      normal: {
        summary: 'Example of a normal user',
        value: {
          email: 'nguyenvana@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const result = await this.authsService.forgotPassword(forgotPasswordDto);
    return ok(result, 'Password reset email sent successfully', 200);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @ApiBody({
    description: 'Reset password',
    type: String,
    examples: {
      normal: {
        summary: 'Example of a normal user',
        value: {
          codeVerify: '123456',
          password: '123456',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const result = await this.authsService.resetPassword(resetPasswordDto);
    return ok(result, 'Password reset successfully', 200);
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change password' })
  @ApiBody({
    description: 'Change password',
    type: String,
    examples: {
      normal: {
        summary: 'Example of a normal user',
        value: {
          oldPassword: '123456',
          newPassword: '123456',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async changePassword(
    @Req() req: Request,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = (req as any).user.userId;
    const result = await this.authsService.changePassword(
      userId,
      changePasswordDto,
    );
    return ok(result, 'Password changed successfully', 200);
  }

  @Post('logout-all-devices')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Logout all devices' })
  @ApiBody({
    description: 'Logout all devices',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Logout all devices successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async logoutAllDevices(@Req() req: Request) {
    const userId = (req as any).user.userId;
    const result = await this.authsService.logoutAllDevices(userId);
    return ok(result, 'Logout all devices successfully', 200);
  }

  @Post('logout-device')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Logout device' })
  @ApiBody({
    description: 'Logout device',
    type: String,
    examples: {
      normal: {
        summary: 'Example of a normal user',
        value: {
          deviceId: '1234567890',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Logout device successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async logoutDevice(
    @Req() req: Request,
    @Body() logoutDeviceDto: LogoutDeviceAuthDto,
  ) {
    const userId = (req as any).user.userId;
    const result = await this.authsService.logoutDevice(
      userId,
      logoutDeviceDto,
    );
    return ok(result, 'Logout device successfully', 200);
  }

  @Post('logout-not-device')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Logout not device' })
  @ApiBody({
    description: 'Logout not device',
    type: String,
    examples: {
      normal: {
        summary: 'Example of a normal user',
        value: {
          deviceId: '1234567890',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Logout not device successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async logoutNotDevice(
    @Req() req: Request,
    @Body() logoutDeviceDto: LogoutDeviceAuthDto,
  ) {
    const userId = (req as any).user.userId;
    const result = await this.authsService.logoutNotDevice(
      userId,
      logoutDeviceDto,
    );
    return ok(result, 'Logout not device successfully', 200);
  }

  @ApiOperation({ summary: 'Google login' })
  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    return ok('Redirecting to Google...', 'Redirecting to Google...', 200);
  }

  @ApiOperation({ summary: 'Google callback' })
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res) {
    const { accessToken, refreshToken } =
      await this.authsService.loginWithGoogle(req.user);

    return ok({ accessToken, refreshToken }, 'Google login successfully', 200);
  }

  @ApiOperation({ summary: 'Google one tap' })
  @Post('google/one-tap')
  async googleOneTap(@Body('credential') credential: string) {
    const result = await this.authsService.googleOneTap(credential);
    return ok(result, 'Google one tap successfully', 200);
  }

  @ApiOperation({ summary: 'Facebook login' })
  @Get('facebook/login')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin() {
    return ok('Redirecting to Facebook...', 'Redirecting to Facebook...', 200);
  }

  @ApiOperation({ summary: 'Facebook callback' })
  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookCallback(@Req() req, @Res() res) {
    const { accessToken, refreshToken } =
      await this.authsService.loginWithFacebook(req.user);
    return ok(
      { accessToken, refreshToken },
      'Facebook login successfully',
      200,
    );
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getProfile(@Req() req: Request) {
    const userId = (req as any).user.userId;
    const result = await this.authsService.getProfile(userId);
    return ok(result, 'Profile retrieved successfully', 200);
  }
}

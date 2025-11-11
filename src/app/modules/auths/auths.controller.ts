import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ok } from 'src/app/common/response/api-response';

@ApiTags('Auths')
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
          "fullname": "Nguyen Van A",
          "username": "nguyenvana",
          "email": "nguyenvana@example.com",
          "password": "123456",
          "birthDate": "2015-09-15",
          "role": "parent",
          "phone": "0912345678",
          "gender": "male",
          "typeAccount": "email"
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })

  async register(@Body() registerAuthDto: RegisterAuthDto) {
    if (
      !registerAuthDto.username ||
      !registerAuthDto.email ||
      !registerAuthDto.password
    ) {
      throw new Error('Missing required fields: username, email, or password');
    }
    this.logger.log(`Registering user: ${registerAuthDto.username}`);
    const result = await this.authsService.register(registerAuthDto);
    return ok(result, 'User registered successfully', 201);
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
          "email": "nguyenvana@example.com",
          "password": "123456",
          "deviceId": "1234567890",
          "typeDevice": "android",
          "typeLogin": "email"
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async login(@Body() loginAuthDto: LoginAuthDto) {
    const result = await this.authsService.login(loginAuthDto);
    return ok(result, 'User logged in successfully', 200);
  }
}

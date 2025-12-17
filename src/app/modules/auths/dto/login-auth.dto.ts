import { IsString, MinLength } from 'class-validator';

export class LoginAuthDto {
  @IsString()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  deviceId: string; // ID thiết bị
}

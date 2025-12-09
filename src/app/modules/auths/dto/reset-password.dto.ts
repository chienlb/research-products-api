import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    codeVerify: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class VerifyEmailDto {
    @IsString()
    @IsNotEmpty()
    codeVerify: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;
}
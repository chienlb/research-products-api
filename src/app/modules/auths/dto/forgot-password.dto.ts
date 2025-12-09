import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class ForgotPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}
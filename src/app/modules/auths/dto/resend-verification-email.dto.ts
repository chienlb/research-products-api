import { IsNotEmpty, IsEmail } from 'class-validator';

export class ResendVerificationEmailDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}
import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '../schema/payment.schema';

export class CreatePaymentDto {
    @IsMongoId()
    @IsNotEmpty()
    userId: string;

    @IsMongoId()
    @IsOptional()
    subscriptionId?: string;

    @IsEnum(PaymentMethod)
    method: PaymentMethod;

    @IsNumber()
    amount: number;

    @IsString()
    @IsNotEmpty()
    currency: string;

    @IsOptional()
    @IsString()
    description?: string;
}

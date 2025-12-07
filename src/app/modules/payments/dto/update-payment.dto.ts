import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { PaymentStatus } from '../schema/payment.schema';

export class UpdatePaymentDto {
    @IsEnum(PaymentStatus)
    status: PaymentStatus;

    @IsOptional()
    @IsString()
    transactionId?: string;

    @IsOptional()
    @IsDateString()
    paidAt?: Date;
}

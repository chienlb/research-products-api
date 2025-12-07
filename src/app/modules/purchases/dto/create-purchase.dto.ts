import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PurchaseStatus } from '../schema/purchase.schema';

export class CreatePurchaseDto {
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsString()
    packageId: string;

    @IsNotEmpty()
    @IsString()
    transactionId: string;

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsString()
    currency: string;

    @IsNotEmpty()
    @IsEnum(PurchaseStatus)
    status: PurchaseStatus;
}

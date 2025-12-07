import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PurchaseDocument = HydratedDocument<Purchase>;

export enum PurchaseStatus {
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed',
}

export interface IPurchase {
    userId: Types.ObjectId; // ID người dùng
    packageId: Types.ObjectId; // ID gói đăng ký
    transactionId: string; // Mã giao dịch
    amount: number; // Số tiền
    currency: string; // Loại tiền tệ
    status: PurchaseStatus; // Trạng thái
    createdAt?: Date; // Ngày tạo
    updatedAt?: Date; // Ngày cập nhật
}

@Schema({ collection: 'purchases', timestamps: true })
export class Purchase implements IPurchase {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;
    @Prop({ type: Types.ObjectId, ref: 'Package', required: true })
    packageId: Types.ObjectId;
    @Prop({ required: true })
    transactionId: string;
    @Prop({ required: true })
    amount: number;
    @Prop({ default: 'VND' })
    currency: string;
    @Prop({
        type: String,
        enum: PurchaseStatus,
        default: PurchaseStatus.PENDING,
    })
    status: PurchaseStatus;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);

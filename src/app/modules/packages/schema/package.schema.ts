import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PackageDocument = HydratedDocument<Package>;

export enum PackageType {
  FREE = 'free', // Gói miễn phí
  STANDARD = 'standard', // Gói tiêu chuẩn
  PREMIUM = 'premium', // Gói cao cấp
  VIP = 'vip', // Gói VIP
}

export interface IPackage {
  name: string; // Tên gói nâng cấp
  description?: string; // Mô tả gói nâng cấp
  type: PackageType; // Loại gói nâng cấp
  durationInDays: number; // Thời lượng gói nâng cấp (tính theo ngày)
  price: number; // Giá gói nâng cấp
  currency: string; // Loại tiền tệ (ví dụ: VND, USD)
  features: string[]; // Tính năng đi kèm gói nâng cấp
  isActive: boolean; // Gói nâng cấp còn hoạt động không
  createdBy?: Types.ObjectId; // ID người tạo gói
  updatedBy?: Types.ObjectId; // ID người cập nhật gói lần cuối
  createdAt?: Date; // Ngày tạo
  updatedAt?: Date; // Ngày cập nhật
}

@Schema({ collection: 'packages', timestamps: true })
export class Package implements IPackage {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: PackageType,
    default: PackageType.FREE,
  })
  type: PackageType;

  @Prop({ required: true })
  durationInDays: number;

  @Prop({ required: true, default: 0 })
  price: number;

  @Prop({ default: 'VND' })
  currency: string;

  @Prop({ type: [String], default: [] })
  features: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'users' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'users' })
  updatedBy?: Types.ObjectId;
}

export const PackageSchema = SchemaFactory.createForClass(Package);

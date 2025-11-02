import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

export type BadgeDocument = HydratedDocument<Badge>;

export enum BadgeType {
  ACHIEVEMENT = 'achievement', // Thành tích (VD: hoàn thành 10 bài học)
  STREAK = 'streak', // Duy trì chuỗi ngày học
  PARTICIPATION = 'participation', // Tham gia sự kiện, nhóm
  PERFORMANCE = 'performance', // Điểm cao trong bài kiểm tra
  SPECIAL = 'special', // Huy hiệu đặc biệt (do admin tặng)
}

export interface IBadge {
  _id: Types.ObjectId;
  name: string; // Tên huy hiệu
  description: string; // Mô tả ngắn
  iconUrl: string; // Ảnh biểu tượng huy hiệu
  type: BadgeType; // Phân loại huy hiệu
  level?: number; // Cấp độ (VD: 1 - Bronze, 2 - Silver, 3 - Gold)
  criteria: string; // Tiêu chí nhận huy hiệu
  triggerEvent?: string; // Sự kiện kích hoạt (VD: "complete_lesson", "login_streak_7")
  requiredValue?: number; // Mốc yêu cầu (VD: 10 bài học, 7 ngày streak)
  givenTo: Types.ObjectId[]; // Danh sách người dùng đã nhận huy hiệu
  isActive: boolean; // Huy hiệu còn hiệu lực hay không
  createdBy?: Types.ObjectId; // Người tạo
  updatedBy?: Types.ObjectId; // Người chỉnh sửa
  createdAt?: Date; // Ngày tạo
  updatedAt?: Date; // Ngày cập nhật
}

export interface IBadgeResponse extends Omit<IBadge, '_id'> {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBadgeInput extends Partial<IBadge> {
  createdAt?: Date;
  updatedAt?: Date;
}

@Schema({ collection: 'badges', timestamps: true })
export class Badge {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  iconUrl: string;

  @Prop({ required: true, enum: BadgeType })
  type: BadgeType;

  @Prop({ type: Number, default: 1 })
  level?: number;

  @Prop({ required: true })
  criteria: string;

  @Prop()
  triggerEvent?: string;

  @Prop()
  requiredValue?: number;

  @Prop({ type: [Types.ObjectId], ref: 'users', default: [] })
  givenTo: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'users' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'users' })
  updatedBy?: Types.ObjectId;
}

export const BadgeSchema = SchemaFactory.createForClass(Badge);

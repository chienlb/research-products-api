import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type UserBadgeDocument = HydratedDocument<UserBadge>;

export interface IUserBadge {
  userId: Types.ObjectId; // ID người dùng (ref tới User)
  badgeId: Types.ObjectId; // ID huy hiệu (ref tới Badge)
  awardedAt: Date; // Ngày nhận huy hiệu
  reason?: string; // Lý do trao huy hiệu (nếu có)
  awardedBy?: Types.ObjectId; // Người tạo huy hiệu
  isRevoked?: boolean; // Huy hiệu có bị thu hồi không
  revokedAt?: Date; // Ngày thu hồi (nếu có)
  note?: string; // Ghi chú thêm
}

@Schema({ collection: 'user_badges', timestamps: true })
export class UserBadge {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Badge',
    required: true,
    index: true,
  })
  badgeId: Types.ObjectId;

  @Prop({ type: Date, required: true, default: Date.now })
  awardedAt: Date;

  @Prop({ type: String })
  reason?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  awardedBy?: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isRevoked?: boolean;

  @Prop({ type: Date })
  revokedAt?: Date;

  @Prop({ type: String })
  note?: string;
}

export const UserBadgeSchema = SchemaFactory.createForClass(UserBadge);

// Index để đảm bảo mỗi user chỉ có 1 bản ghi cho cùng 1 badge
UserBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

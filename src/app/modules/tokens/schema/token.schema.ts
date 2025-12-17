import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

export type TokenDocument = HydratedDocument<Token>;

export interface IToken {
  userId: Types.ObjectId; // ID người dùng sở hữu token
  token: string; // Giá trị token đăng nhập
  deviceId: string; // ID thiết bị
  isDeleted: boolean; // Trạng thái token đã bị xóa hay chưa
}

// Dữ liệu đầu vào khi tạo hoặc cập nhật token đăng nhập
export type ITokenInput = Omit<IToken, 'isDeleted'>;

// Dữ liệu phản hồi khi lấy thông tin token đăng nhập
export interface ITokenResponse extends IToken {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

@Schema({ collection: 'tokens', timestamps: true })
export class Token implements IToken {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const TokenSchema = SchemaFactory.createForClass(Token);

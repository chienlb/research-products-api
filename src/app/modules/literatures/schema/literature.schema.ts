import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

export type LiteratureDocument = HydratedDocument<Literature>;

export enum LiteratureType {
  STORY = 'story',
  POEM = 'poem',
  DIALOGUE = 'dialogue',
  SONG = 'song',
  ARTICLE = 'article',
}

export enum LiteratureLevel {
  STARTER = 'starter',
  BEGINNER = 'beginner',
  ELEMENTARY = 'elementary',
  PRE_INTERMEDIATE = 'pre-intermediate',
  INTERMEDIATE = 'intermediate',
}

export interface ILiterature {
  title: string; // Tên bài đọc / truyện / thơ
  type: LiteratureType; // Loại nội dung
  level: LiteratureLevel; // Trình độ tiếng Anh
  topic?: string; // Chủ đề: animals, friendship, nature, school,...
  contentEnglish: string; // Nội dung tiếng Anh
  contentVietnamese?: string; // Bản dịch tiếng Việt (nếu có)
  vocabulary?: string[]; // Danh sách từ vựng chính
  grammarPoints?: string[]; // Cấu trúc ngữ pháp liên quan
  audioUrl?: string; // Đường dẫn file âm thanh
  imageUrl?: string; // Ảnh minh họa (bìa hoặc hình nội dung)
  comprehensionQuestions?: string[]; // Câu hỏi đọc hiểu
  isPublished: boolean; // Có công khai trên website không
  createdBy?: Types.ObjectId; // Người tạo (giáo viên / admin)
  updatedBy?: Types.ObjectId; // Người chỉnh sửa lần cuối
  createdAt?: Date; // Ngày tạo
  updatedAt?: Date; // Ngày cập nhật
}

@Schema({ collection: 'literatures', timestamps: true })
export class Literature {
  @Prop({ required: true })
  title: string;

  @Prop({
    type: String,
    enum: LiteratureType,
    default: LiteratureType.STORY,
    required: true,
  })
  type: LiteratureType;

  @Prop({
    type: String,
    enum: LiteratureLevel,
    default: LiteratureLevel.BEGINNER,
    required: true,
  })
  level: LiteratureLevel;

  @Prop()
  topic?: string;

  @Prop({ required: true })
  contentEnglish: string;

  @Prop()
  contentVietnamese?: string;

  @Prop({ type: [String], default: [] })
  vocabulary?: string[];

  @Prop({ type: [String], default: [] })
  grammarPoints?: string[];

  @Prop()
  audioUrl?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ type: [String], default: [] })
  comprehensionQuestions?: string[];

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const LiteratureSchema = SchemaFactory.createForClass(Literature);
LiteratureSchema.index({ title: 'text', topic: 'text' });

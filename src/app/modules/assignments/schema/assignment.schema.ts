import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

export type AssignmentDocument = HydratedDocument<Assignment>;

export enum AssignmentType {
  READING = 'reading',
  WRITING = 'writing',
  LISTENING = 'listening',
  SPEAKING = 'speaking',
  QUIZ = 'quiz',
  PROJECT = 'project',
}

export interface IAssignment {
  title: string; // Tiêu đề bài tập
  description?: string; // Mô tả chi tiết
  type: AssignmentType; // Loại bài tập
  lessonId?: Types.ObjectId; // ID bài học
  classId?: Types.ObjectId; // ID lớp học
  dueDate?: Date; // Hạn nộp bài
  maxScore: number; // Điểm tối đa
  attachments?: string[]; // Tệp đính kèm (nếu có)
  createdBy: Types.ObjectId; // ID người tạo bài tập
  updatedBy?: Types.ObjectId; // ID người cập nhật bài tập lần cuối
  isPublished: boolean; // Bài tập có được công khai không
}

@Schema({ collection: 'assignments', timestamps: true })
export class Assignment implements IAssignment {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: AssignmentType,
    default: AssignmentType.QUIZ,
  })
  type: AssignmentType;

  @Prop({ type: Types.ObjectId, ref: 'Lesson' })
  lessonId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Class' })
  classId?: Types.ObjectId;

  @Prop()
  dueDate?: Date;

  @Prop({ required: true, default: 10 })
  maxScore: number;

  @Prop({ type: [String], default: [] })
  attachments?: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop({ default: false })
  isPublished: boolean;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
AssignmentSchema.index({ classId: 1, dueDate: -1 });
AssignmentSchema.index({ title: 'text', description: 'text' });

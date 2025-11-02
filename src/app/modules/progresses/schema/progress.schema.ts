import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

export type ProgressDocument = HydratedDocument<Progress>;

export enum ProgressType {
  COURSE = 'course', // Khóa học
  LESSON = 'lesson', // Bài học
  ASSIGNMENT = 'assignment', // Bài tập
}

export enum ProgressStatus {
  NOT_STARTED = 'not_started', // Chưa bắt đầu
  IN_PROGRESS = 'in_progress', // Đang tiến hành
  COMPLETED = 'completed', // Đã hoàn thành
}

export interface IProgress {
  userId: Types.ObjectId; // Học sinh
  type: ProgressType; // Loại tiến độ (khóa học / bài học / bài tập)
  courseId?: Types.ObjectId; // ID khóa học (nếu có)
  lessonId?: Types.ObjectId; // ID bài học (nếu có)
  assignmentId?: Types.ObjectId; // ID bài tập (nếu có)
  progressPercent: number; // Phần trăm hoàn thành (0–100)
  timeSpent: number; // Tổng thời gian học (phút)
  score?: number; // Điểm trung bình / điểm bài tập
  status: ProgressStatus; // Trạng thái
  lastActivityAt?: Date; // Hoạt động gần nhất
  completedAt?: Date; // Ngày hoàn thành (nếu có)
  streakDays?: number; // Chuỗi ngày học liên tục
  updatedBy?: Types.ObjectId; // Người cập nhật cuối
}

@Schema({ collection: 'progresses', timestamps: true })
export class Progress implements IProgress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ProgressType,
    required: true,
  })
  type: ProgressType;

  @Prop({ type: Types.ObjectId, ref: 'Course' })
  courseId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson' })
  lessonId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Assignment' })
  assignmentId?: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  progressPercent: number;

  @Prop({ type: Number, default: 0 })
  timeSpent: number;

  @Prop()
  score?: number;

  @Prop({
    type: String,
    enum: ProgressStatus,
    default: ProgressStatus.NOT_STARTED,
  })
  status: ProgressStatus;

  @Prop()
  lastActivityAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop({ default: 0 })
  streakDays?: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);

// Middleware: tự động cập nhật trạng thái dựa vào phần trăm
ProgressSchema.pre('save', function (next) {
  if (this.progressPercent >= 100 && this.status !== ProgressStatus.COMPLETED) {
    this.status = ProgressStatus.COMPLETED;
    this.completedAt = new Date();
  } else if (this.progressPercent > 0 && this.progressPercent < 100) {
    this.status = ProgressStatus.IN_PROGRESS;
  }
  this.lastActivityAt = new Date();
  next();
});

// Indexes để tối ưu tìm kiếm
ProgressSchema.index({ userId: 1, courseId: 1 });
ProgressSchema.index({ userId: 1, lessonId: 1 });
ProgressSchema.index({ userId: 1, type: 1 });
ProgressSchema.index({ status: 1 });

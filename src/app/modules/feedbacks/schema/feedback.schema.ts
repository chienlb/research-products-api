import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FeedbackDocument = HydratedDocument<Feedback>;

export enum FeedbackType {
  GENERAL = 'general',
  LESSON = 'lesson',
  FEATURE = 'feature',
  BUG = 'bug',
}

export interface IFeedback {
  userId: Types.ObjectId;
  type: FeedbackType;
  title: string;
  content: string;
  rating?: number;
  relatedId?: Types.ObjectId;
  isResolved: boolean;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
}

@Schema({ collection: 'feedbacks', timestamps: true })
export class Feedback implements IFeedback {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    enum: FeedbackType,
    default: FeedbackType.GENERAL,
  })
  type: FeedbackType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  rating?: number;

  @Prop({ type: Types.ObjectId })
  relatedId?: Types.ObjectId;

  @Prop({ default: false })
  isResolved: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  resolvedBy?: Types.ObjectId;

  @Prop()
  resolvedAt?: Date;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
FeedbackSchema.index({ userId: 1, type: 1 });
FeedbackSchema.index({ isResolved: 1 });

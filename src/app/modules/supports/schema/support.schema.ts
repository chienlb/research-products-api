import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SupportDocument = HydratedDocument<Support>;

export enum SupportStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export interface ISupport {
  userId: Types.ObjectId;
  subject: string;
  message: string;
  attachments?: string[];
  status: SupportStatus;
  assignedTo?: Types.ObjectId;
  response?: string;
  resolvedAt?: Date;
}

@Schema({ collection: 'supports', timestamps: true })
export class Support implements ISupport {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: [String], default: [] })
  attachments?: string[];

  @Prop({
    type: String,
    enum: SupportStatus,
    default: SupportStatus.OPEN,
  })
  status: SupportStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo?: Types.ObjectId;

  @Prop()
  response?: string;

  @Prop()
  resolvedAt?: Date;
}

export const SupportSchema = SchemaFactory.createForClass(Support);
SupportSchema.index({ userId: 1, status: 1 });

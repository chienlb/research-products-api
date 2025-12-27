import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schema/user.schema';
import { Unit } from '../../units/schema/unit.schema';

export type UnitProgressDocument = HydratedDocument<UnitProgress>;

export enum UnitProgressStatus {
    NOT_STARTED = 'not_started',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
}

export interface IUnitProgress {
    userId: Types.ObjectId; // Học sinh
    unitId: Types.ObjectId; // Chủ đề học
    orderIndex: number; // Thứ tự của Unit
    progress: number; // Phần trăm hoàn thành
    status: UnitProgressStatus; // Trạng thái
    completedAt: Date; // Ngày hoàn thành
    createBy: Types.ObjectId; // Người tạo
    updatedBy: Types.ObjectId; // Người cập nhật
}

export class UnitProgress implements IUnitProgress {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Unit', required: true })
    unitId: Types.ObjectId;

    @Prop({ type: Number, default: 0 })
    orderIndex: number;

    @Prop({ type: Number, default: 0 })
    progress: number;

    @Prop({ enum: UnitProgressStatus, default: UnitProgressStatus.NOT_STARTED })
    status: UnitProgressStatus;

    @Prop()
    completedAt: Date;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy: Types.ObjectId;
}

export const UnitProgressSchema = SchemaFactory.createForClass(UnitProgress);
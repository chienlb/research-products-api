import { IsEnum, IsMongoId, IsNumber, IsOptional, IsDate, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ProgressType, ProgressStatus } from '../schema/progress.schema';

export class CreateProgressDto {
  @IsMongoId()
  userId: string;

  @IsEnum(ProgressType)
  type: ProgressType;

  @IsOptional()
  @IsMongoId()
  courseId?: string;

  @IsOptional()
  @IsMongoId()
  lessonId?: string;

  @IsOptional()
  @IsMongoId()
  assignmentId?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercent: number;

  @IsNumber()
  @Min(0)
  timeSpent: number;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsEnum(ProgressStatus)
  status: ProgressStatus;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastActivityAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completedAt?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  streakDays?: number;

  @IsOptional()
  @IsMongoId()
  updatedBy?: string;
}

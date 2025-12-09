import { IsEnum, IsMongoId, IsNumber, IsOptional, IsDate, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ProgressType, ProgressStatus } from '../schema/progress.schema';
import { CreateProgressDto } from './create-progress.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateProgressDto extends PartialType(CreateProgressDto) {
  @IsOptional()
  @IsEnum(ProgressType)
  type?: ProgressType;

  @IsOptional()
  @IsMongoId()
  courseId?: string;

  @IsOptional()
  @IsMongoId()
  lessonId?: string;

  @IsOptional()
  @IsMongoId()
  assignmentId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsEnum(ProgressStatus)
  status?: ProgressStatus;

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

import {
    IsString,
    IsEnum,
    IsOptional,
    IsMongoId,
    IsDate,
    IsArray,
    IsNumber,
    Min,
    IsBoolean,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import {
    CompetitionType,
    CompetitionStatus,
    CompetitionVisibility,
    CompetitionResult,
  } from '../schema/competition.schema';
  
  export class CreateCompetitionDto {
    @IsString()
    name: string;
  
    @IsOptional()
    @IsString()
    description?: string;
  
    @IsEnum(CompetitionType)
    type: CompetitionType;
  
    @IsOptional()
    @IsString()
    subject?: string;
  
    @IsDate()
    @Type(() => Date)
    startTime: Date;
  
    @IsDate()
    @Type(() => Date)
    endTime: Date;
  
    @IsOptional()
    @IsMongoId()
    createdBy?: string;
  
    @IsOptional()
    @IsMongoId()
    updatedBy?: string;
  
    @IsNumber()
    @Min(0)
    totalParticipants: number;
  
    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    participants?: string[];
  
    @IsOptional()
    @IsNumber()
    @Min(1)
    maxParticipants?: number;
  
    @IsOptional()
    @IsString()
    prize?: string;
  
    @IsEnum(CompetitionStatus)
    status: CompetitionStatus;
  
    @IsOptional()
    results?: CompetitionResult[];
  
    @IsOptional()
    @IsMongoId()
    badgeId?: string;
  
    @IsOptional()
    @IsEnum(CompetitionVisibility)
    visibility?: CompetitionVisibility;
  
    @IsBoolean()
    isPublished: boolean;
  }
  
import { IsString, IsOptional, IsEnum, IsBoolean, IsArray, IsUrl } from 'class-validator';
import { Types } from 'mongoose';
import { LiteratureType, LiteratureLevel } from '../schema/literature.schema';

export class CreateLiteratureDto {
    @IsString()
    title: string; // Tên bài đọc / truyện / thơ

    @IsEnum(LiteratureType)
    type: LiteratureType; // Loại nội dung

    @IsEnum(LiteratureLevel)
    level: LiteratureLevel; // Trình độ tiếng Anh

    @IsOptional()
    @IsString()
    topic?: string; // Chủ đề

    @IsString()
    contentEnglish: string; // Nội dung tiếng Anh

    @IsOptional()
    @IsString()
    contentVietnamese?: string; // Dịch tiếng Việt

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    vocabulary?: string[]; // Từ vựng

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    grammarPoints?: string[]; // Điểm ngữ pháp

    @IsOptional()
    @IsUrl()
    audioUrl?: string;

    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    comprehensionQuestions?: string[];

    @IsBoolean()
    isPublished: boolean; // Có công khai không

    @IsOptional()
    createdBy?: Types.ObjectId;

    @IsOptional()
    updatedBy?: Types.ObjectId;
}

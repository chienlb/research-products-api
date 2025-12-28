import {
    IsString,
    IsOptional,
    IsEnum,
    IsNumber,
    IsMongoId,
    IsBoolean,
    IsArray,
    ValidateNested,
    Min,
    Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
    LessonType,
    LessonLevel,
    LessonSkill,
    LessonStatus,
    LessonActivityType,
} from '../schema/lesson.schema';

// Lesson Flow Content DTOs
class QuestionAnswerDto {
    @IsString()
    question: string;

    @IsString()
    answer: string;
}

class VocabularyWordDto {
    @IsString()
    word: string;

    @IsString()
    definition: string;

    @IsOptional()
    @IsString()
    ipa?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsString()
    audio?: string;
}

class GrammarExampleDto {
    @IsString()
    example: string;

    @IsOptional()
    @IsString()
    translation?: string;
}

class LessonFlowVocabularyDto {
    @IsOptional()
    @IsString()
    description?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VocabularyWordDto)
    words: VocabularyWordDto[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}

class LessonFlowGrammarDto {
    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    rule: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GrammarExampleDto)
    examples: GrammarExampleDto[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}

class LessonFlowDialogueDto {
    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    script: string;

    @IsOptional()
    @IsString()
    audio?: string;

    @IsOptional()
    @IsString()
    translation?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}

class LessonFlowReadingDto {
    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    passage: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionAnswerDto)
    questionsAndAnswers?: QuestionAnswerDto[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}

class LessonFlowExerciseDto {
    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    type: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionAnswerDto)
    questionsAndAnswers: QuestionAnswerDto[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}

class LessonFlowQuizDto {
    @IsOptional()
    @IsString()
    description?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionAnswerDto)
    questionsAndAnswers: QuestionAnswerDto[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}

class LessonFlowReviewDto {
    @IsOptional()
    @IsString()
    description?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionAnswerDto)
    questionsAndAnswers: QuestionAnswerDto[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}

class LessonFlowSummaryDto {
    @IsOptional()
    @IsString()
    description?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionAnswerDto)
    questionsAndAnswers: QuestionAnswerDto[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}

class LessonFlowGameDto {
    @IsOptional()
    @IsString()
    description?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionAnswerDto)
    questionsAndAnswers: QuestionAnswerDto[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}

class SongVocabularyWordDto {
    @IsString()
    word: string;

    @IsString()
    definition: string;

    @IsOptional()
    @IsString()
    ipa?: string;
}

class LessonFlowSongDto {
    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    lyrics: string;

    @IsOptional()
    @IsString()
    translation?: string;

    @IsOptional()
    @IsString()
    audio?: string;

    @IsOptional()
    @IsString()
    video?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SongVocabularyWordDto)
    vocabulary?: SongVocabularyWordDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionAnswerDto)
    questionsAndAnswers: QuestionAnswerDto[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}

class LessonFlowContentDto {
    @IsOptional()
    @ValidateNested()
    @Type(() => LessonFlowVocabularyDto)
    vocabulary?: LessonFlowVocabularyDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => LessonFlowGrammarDto)
    grammar?: LessonFlowGrammarDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => LessonFlowDialogueDto)
    dialogue?: LessonFlowDialogueDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => LessonFlowReadingDto)
    reading?: LessonFlowReadingDto;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LessonFlowExerciseDto)
    exercises?: LessonFlowExerciseDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LessonFlowQuizDto)
    quizzes?: LessonFlowQuizDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LessonFlowReviewDto)
    reviews?: LessonFlowReviewDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LessonFlowSummaryDto)
    summaries?: LessonFlowSummaryDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LessonFlowGameDto)
    games?: LessonFlowGameDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LessonFlowSongDto)
    songs?: LessonFlowSongDto[];
}

class LessonFlowItemDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    duration?: number;

    @IsNumber()
    @Min(0)
    step: number;

    @IsEnum(LessonActivityType)
    type: LessonActivityType;

    @IsOptional()
    @IsEnum(LessonSkill)
    skillFocus?: LessonSkill;

    @IsOptional()
    @ValidateNested()
    @Type(() => LessonFlowContentDto)
    content?: LessonFlowContentDto;
}

export class CreateLessonDto {
    @IsString()
    title: string;

    @IsString()
    slug: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsEnum(LessonType)
    type: LessonType;

    @IsEnum(LessonLevel)
    level: LessonLevel;

    @IsOptional()
    @IsNumber()
    @Min(0)
    orderIndex?: number;

    @IsMongoId()
    unit: string;

    @IsOptional()
    @IsString()
    topic?: string;

    @IsOptional()
    @IsEnum(LessonSkill)
    skillFocus?: LessonSkill;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LessonFlowItemDto)
    lessonFlow?: LessonFlowItemDto[];

    @IsOptional()
    @IsBoolean()
    locked?: boolean;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1000)
    estimatedDuration?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    materials?: string[];

    @IsOptional()
    @IsString()
    thumbnail?: string;

    @IsOptional()
    @IsString()
    audioIntro?: string;

    @IsOptional()
    @IsString()
    videoIntro?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    @IsEnum(LessonStatus)
    isActive?: LessonStatus;

    @IsMongoId()
    createdBy: string;

    @IsOptional()
    @IsMongoId()
    updatedBy?: string;
}

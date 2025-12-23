import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AssessPronunciationDto {
  @ApiProperty({
    description: 'Reference text to compare pronunciation against',
    example: 'Good morning',
  })
  @IsString()
  @IsNotEmpty()
  referenceText: string;

  @ApiProperty({
    description: 'Language code for pronunciation assessment',
    example: 'en-US',
    default: 'en-US',
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;
}

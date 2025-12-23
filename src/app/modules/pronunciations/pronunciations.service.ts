// pronunciation.service.ts
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { envSchema } from 'src/app/configs/env/env.config';
import { CreatePronunciationExerciseDto } from './dto/create-pronunciation-exercise.dto';
import {
  PronunciationExercise,
  PronunciationExerciseDocument,
} from './schema/pronunciation-exercise.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudflareService } from '../cloudflare/cloudflare.service';
import { UsersService } from '../users/users.service';
import { LessonsService } from '../lessons/lessons.service';
import { UnitsService } from '../units/units.service';
import { UpdatePronunciationExerciseDto } from './dto/update-pronunciation-exercise.dto';

const env = envSchema.parse(process.env);

type AssessInput = {
  audioBuffer: Buffer;
  referenceText: string;
  language: string; // e.g. en-US
};

@Injectable()
export class PronunciationService {
  constructor(
    @InjectModel(PronunciationExercise.name)
    private pronunciationExerciseModel: Model<PronunciationExerciseDocument>,
    private cloudflareService: CloudflareService,
    private usersService: UsersService,
    private lessonService: LessonsService,
    private unitsService: UnitsService,
  ) { }

  async assessShortAudio(input: AssessInput) {
    console.log('env');
    console.log(env.AZURE_SPEECH_REGION);
    console.log(env.AZURE_SPEECH_KEY);
    if (!env.AZURE_SPEECH_REGION || !env.AZURE_SPEECH_KEY) {
      throw new InternalServerErrorException(
        'Missing AZURE_SPEECH_REGION / AZURE_SPEECH_KEY in env',
      );
    }

    const { audioBuffer, referenceText, language } = input;

    // Pronunciation Assessment header (Base64 JSON)
    const pronParams = {
      ReferenceText: referenceText,
      GradingSystem: 'HundredMark', // FivePoint | HundredMark
      Granularity: 'Word', // Phoneme | Word | FullText
      Dimension: 'Comprehensive', // Basic | Comprehensive
      EnableMiscue: 'True', // bắt lỗi thiếu/thừa từ
      EnableProsodyAssessment: 'True', // prosody (stress/intonation/rhythm)
    };

    console.log(env.AZURE_SPEECH_KEY);
    console.log(env.AZURE_SPEECH_REGION);

    const pronHeader = Buffer.from(JSON.stringify(pronParams), 'utf8').toString(
      'base64',
    );

    const url =
      `https://${env.AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1` +
      `?language=${encodeURIComponent(language)}&format=detailed`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
        'Ocp-Apim-Subscription-Key': env.AZURE_SPEECH_KEY,
        'Pronunciation-Assessment': pronHeader,
      },
      body: new Uint8Array(audioBuffer),
    });

    const bodyText = await res.text();
    if (!res.ok) {
      // In ra message rõ ràng để debug 401/403/400
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        throw new BadRequestException(
          `Azure Speech API error ${res.status}: ${bodyText}`,
        );
      }
      throw new InternalServerErrorException(
        `Azure Speech API error ${res.status}: ${bodyText}`,
      );
    }

    let json;
    try {
      json = JSON.parse(bodyText);
    } catch (parseError) {
      const errorMessage =
        parseError instanceof Error ? parseError.message : String(parseError);
      throw new InternalServerErrorException(
        `Failed to parse Azure Speech API response: ${errorMessage}`,
      );
    }

    const best = json?.NBest?.[0];

    return {
      status: json?.RecognitionStatus,
      recognizedText: best?.Display ?? json?.DisplayText ?? '',
      scores: best
        ? {
          pronScore: best.PronScore,
          accuracy: best.AccuracyScore,
          fluency: best.FluencyScore,
          prosody: best.ProsodyScore,
          completeness: best.CompletenessScore,
          confidence: best.Confidence,
        }
        : null,
      words: best?.Words ?? [],
      raw: json,
    };
  }

  async createPronunciationExercise(input: CreatePronunciationExerciseDto, userId: string) {
    try {
      const {
        text,
        ipa,
        translation,
        description,
        referenceAudio,
        referenceAudioDuration,
        lessonId,
        unitId,
        level,
        difficulty,
        topic,
        tags,
        minScore,
        maxAttempts,
      } = input;
      const user = await this.usersService.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const lesson = await this.lessonService.findLessonById(lessonId as string);
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }
      const unit = await this.unitsService.findUnitById(unitId as string);
      if (!unit) {
        throw new NotFoundException('Unit not found');
      }
      const pronunciationExercise =
        await this.pronunciationExerciseModel.create({
          text,
          ipa,
          translation,
          description,
          referenceAudio,
          referenceAudioDuration,
          lessonId,
          unitId,
          level,
          difficulty,
          topic,
          tags,
          minScore,
          maxAttempts,
          createdBy: userId,
          updatedBy: userId,
        });
      return pronunciationExercise;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getPronunciationExercises(lessonId: string, unitId: string) {
    try {
      const pronunciationExercises = await this.pronunciationExerciseModel.find({ lessonId, unitId });
      return pronunciationExercises;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getPronunciationExerciseById(id: string) {
    try {
      const pronunciationExercise = await this.pronunciationExerciseModel.findById(id);
      return pronunciationExercise;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updatePronunciationExercise(id: string, input: UpdatePronunciationExerciseDto, userId: string) {
    try {
      const user = await this.usersService.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const pronunciationExercise = await this.pronunciationExerciseModel.findByIdAndUpdate(id, input, { new: true });
      if (!pronunciationExercise) {
        throw new NotFoundException('Pronunciation exercise not found');
      }
      pronunciationExercise.updatedBy = user._id;
      await pronunciationExercise.save();
      return pronunciationExercise;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deletePronunciationExercise(id: string) {
    try {
      const pronunciationExercise = await this.pronunciationExerciseModel.findByIdAndDelete(id);
      return pronunciationExercise;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}

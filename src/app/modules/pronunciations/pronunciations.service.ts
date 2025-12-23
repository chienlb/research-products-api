// pronunciation.service.ts
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import { envSchema } from 'src/app/configs/env/env.config';

const env = envSchema.parse(process.env);

type AssessInput = {
  audioBuffer: Buffer;
  referenceText: string;
  language: string; // e.g. en-US
};

@Injectable()
export class PronunciationService {

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
      GradingSystem: 'HundredMark',      // FivePoint | HundredMark
      Granularity: 'Word',               // Phoneme | Word | FullText
      Dimension: 'Comprehensive',        // Basic | Comprehensive
      EnableMiscue: 'True',              // bắt lỗi thiếu/thừa từ
      EnableProsodyAssessment: 'True',   // prosody (stress/intonation/rhythm)
    };

    console.log(env.AZURE_SPEECH_KEY);
    console.log(env.AZURE_SPEECH_REGION);

    const pronHeader = Buffer.from(JSON.stringify(pronParams), 'utf8').toString('base64');

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
}

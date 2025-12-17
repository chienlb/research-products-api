import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateTokenDto {
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean = false;
}

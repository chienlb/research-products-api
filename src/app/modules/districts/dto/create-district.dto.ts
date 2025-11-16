import { IsString, IsNotEmpty, IsOptional, IsDate } from 'class-validator';

export class CreateDistrictDto {
    @IsString()
    @IsNotEmpty()
    districtId: string;

    @IsString()
    @IsNotEmpty()
    districtName: string;

    @IsString()
    @IsNotEmpty()
    districtCode: string;

    @IsString()
    @IsNotEmpty()
    provinceCode: string;

    @IsOptional()
    @IsDate()
    createdAt?: Date;

    @IsOptional()
    @IsDate()
    updatedAt?: Date;
}

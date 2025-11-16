import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSchoolDto {
    @IsString()
    @IsNotEmpty()
    schoolId: string;

    @IsString()
    @IsNotEmpty()
    schoolName: string;

    @IsString()
    @IsNotEmpty()
    schoolLevel: string;

    @IsString()
    @IsNotEmpty()
    districtId: string;

    @IsString()
    @IsNotEmpty()
    districtName: string;

    @IsString()
    @IsNotEmpty()
    provinceId: string;

    @IsString()
    @IsNotEmpty()
    provinceName: string;
}

import { IsString, IsNotEmpty } from 'class-validator';

export class CreateClassDto {
    @IsString()
    @IsNotEmpty()
    classId: string;

    @IsString()
    @IsNotEmpty()
    className: string;

    @IsString()
    @IsNotEmpty()
    schoolGrade: string;

    @IsString()
    @IsNotEmpty()
    schoolId: string;

    @IsString()
    @IsNotEmpty()
    schoolName: string;

    @IsString()
    @IsNotEmpty()
    districtName: string;

    @IsString()
    @IsNotEmpty()
    provinceName: string;
}

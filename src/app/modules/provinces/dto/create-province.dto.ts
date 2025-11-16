import { IsString, IsNotEmpty } from 'class-validator';

export class CreateProvinceDto {
    @IsString()
    @IsNotEmpty()
    provinceId: string;

    @IsString()
    @IsNotEmpty()
    provinceName: string;

    @IsString()
    @IsNotEmpty()
    provinceCode: string;

    @IsString()
    @IsNotEmpty()
    countryCode: string;
}

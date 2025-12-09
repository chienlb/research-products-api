import { IsNotEmpty, IsString } from "class-validator";

export class LogoutDeviceAuthDto {
    @IsString()
    @IsNotEmpty()
    deviceId: string;
}
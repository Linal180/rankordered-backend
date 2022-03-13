import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class MessageToAdminDto {
    @Expose()
    @ApiProperty()
    @IsNotEmpty()
    name: string;

    @Expose()
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @Expose()
    @ApiProperty()
    @IsNotEmpty()
    message: string;
}

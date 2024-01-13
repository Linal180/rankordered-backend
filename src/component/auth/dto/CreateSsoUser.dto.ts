import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateSsoUserDto {
	@ApiProperty({ example: 'john smith' })
	name?: string;

	@ApiProperty({ example: 'johnsmith' })
	@IsNotEmpty()
	username: string;

	@ApiProperty({ example: 'johnsmith@email.com' })
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@ApiProperty({ example: 'youtube' })
	@IsNotEmpty()
	provider?: string;

	@ApiProperty({ example: 'URL' })
	@IsNotEmpty()
	profilePicture?: string;
}

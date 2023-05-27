import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';

export class CreateSocialProfileDTO {
	@ApiProperty({ example: 'youtube' })
	@IsNotEmpty()
	provider: string;

	@ApiProperty({ example: 'johnsmith@email.com' })
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@ApiProperty({ required: true })
	userId: string;

	@ApiProperty()
	primary?: boolean;

	@ApiProperty()
	isFavorite?: boolean;

	@ApiProperty({ example: 'URL' })
	@IsNotEmpty()
	profilePicture: string;
}

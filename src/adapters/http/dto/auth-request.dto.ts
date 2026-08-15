import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequestDto {
  @ApiProperty({ example: 'Ada Lovelace' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'ada@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Str0ngPass!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}

export class LoginRequestDto {
  @ApiProperty({ example: 'ada@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Str0ngPass!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}

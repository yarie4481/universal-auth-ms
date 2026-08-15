import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AppEnvironment,
  ApplicationStatus,
  ApplicationType,
  OAuthProviderType,
} from '../../../domain/enums/application.enums';

export class CreateApplicationDto {
  @ApiProperty({ example: 'Cossap Mobile' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ enum: ApplicationType, example: ApplicationType.MOBILE })
  @IsEnum(ApplicationType)
  type!: ApplicationType;

  @ApiProperty({ enum: AppEnvironment, example: AppEnvironment.development })
  @IsEnum(AppEnvironment)
  environment!: AppEnvironment;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  redirectUris?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedOrigins?: string[];

  @ApiPropertyOptional({ type: [String], example: ['google', 'github'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedProviders?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedScopes?: string[];
}

export class UpdateApplicationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ enum: ApplicationType })
  @IsOptional()
  @IsEnum(ApplicationType)
  type?: ApplicationType;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  redirectUris?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedOrigins?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedProviders?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedScopes?: string[];

  @ApiPropertyOptional({ enum: ApplicationStatus })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;
}

export class UpsertProviderDto {
  @ApiProperty({ enum: OAuthProviderType })
  @IsEnum(OAuthProviderType)
  provider!: OAuthProviderType;

  @ApiProperty({ example: true })
  @IsBoolean()
  enabled!: boolean;

  @ApiProperty({ example: 'google-client-id.apps.googleusercontent.com' })
  @IsString()
  @MinLength(1)
  clientId!: string;

  @ApiProperty({ example: 'GOCSPX-••••••••' })
  @IsString()
  @MinLength(1)
  clientSecret!: string;

  @ApiPropertyOptional({ type: [String], example: ['openid', 'email', 'profile'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @ApiPropertyOptional({
    example: 'http://localhost:3001/api/auth/callback/google',
  })
  @IsOptional()
  @IsString()
  redirectUri?: string;
}

export class PatchProviderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  clientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  clientSecret?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  redirectUri?: string;
}

export class StartOAuthQueryDto {
  @ApiProperty({ description: 'Application client ID' })
  @IsString()
  @MinLength(1)
  clientId!: string;

  @ApiProperty({
    description: 'Where to send the user after successful OAuth (must be allow-listed)',
    example: 'https://app.example.com/auth/callback',
  })
  @IsString()
  @IsUrl({ require_tld: false })
  callbackURL!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  errorCallbackURL?: string;
}

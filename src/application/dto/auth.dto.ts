export interface PublicUserDto {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokensDto {
  accessToken: string;
  jwt: string;
  tokenType: 'Bearer';
  expiresAt: string;
}

export interface AuthResponseDto {
  user: PublicUserDto;
  tokens: AuthTokensDto;
}

export interface MeResponseDto {
  user: PublicUserDto;
  session: {
    id: string;
    expiresAt: string;
  };
}

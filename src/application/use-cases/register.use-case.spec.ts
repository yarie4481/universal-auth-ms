import { RegisterUseCase } from './register.use-case';
import { AuthEnginePort, AuthResult } from '../ports/auth-engine.port';
import { User } from '../../domain/entities/user.entity';
import { Session } from '../../domain/entities/session.entity';
import { InvalidInputError } from '../../domain/errors/auth.errors';

describe('RegisterUseCase', () => {
  const authEngine: jest.Mocked<AuthEnginePort> = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getSession: jest.fn(),
    issueJwt: jest.fn(),
    getJwks: jest.fn(),
    getOAuthAuthorizationUrl: jest.fn(),
  };

  const useCase = new RegisterUseCase(authEngine);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates input then delegates to the auth engine', async () => {
    const now = new Date();
    const result: AuthResult = {
      user: new User({
        id: 'u1',
        email: 'ada@example.com',
        name: 'Ada',
        emailVerified: false,
        image: null,
        createdAt: now,
        updatedAt: now,
      }),
      session: new Session({
        id: 's1',
        userId: 'u1',
        token: 'session-token',
        expiresAt: now,
        ipAddress: null,
        userAgent: null,
        createdAt: now,
        updatedAt: now,
      }),
      tokens: {
        accessToken: 'session-token',
        jwt: 'jwt-token',
        tokenType: 'Bearer',
        expiresAt: now,
      },
    };
    authEngine.register.mockResolvedValue(result);

    const output = await useCase.execute({
      email: 'Ada@Example.com',
      password: 'Str0ngPass!',
      name: 'Ada',
    });

    expect(authEngine.register).toHaveBeenCalledWith({
      email: 'ada@example.com',
      password: 'Str0ngPass!',
      name: 'Ada',
      ipAddress: undefined,
      userAgent: undefined,
    });
    expect(output).toBe(result);
  });

  it('rejects empty names', async () => {
    await expect(
      useCase.execute({
        email: 'ada@example.com',
        password: 'Str0ngPass!',
        name: '   ',
      }),
    ).rejects.toBeInstanceOf(InvalidInputError);
  });
});

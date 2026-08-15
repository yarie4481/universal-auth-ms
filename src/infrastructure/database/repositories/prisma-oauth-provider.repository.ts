import { Injectable } from '@nestjs/common';
import {
  OAuthProviderConfig as PrismaOAuth,
  OAuthProviderType as PrismaProvider,
} from '@prisma/client';
import { OAuthProviderConfig } from '../../../domain/entities/oauth-provider-config.entity';
import { OAuthProviderType } from '../../../domain/enums/application.enums';
import {
  OAuthProviderRepositoryPort,
  UpsertOAuthProviderRecord,
} from '../../../domain/repositories/oauth-provider.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaOAuthProviderRepository
  implements OAuthProviderRepositoryPort
{
  constructor(private readonly prisma: PrismaService) {}

  async upsert(data: UpsertOAuthProviderRecord): Promise<OAuthProviderConfig> {
    const row = await this.prisma.oAuthProviderConfig.upsert({
      where: {
        applicationId_provider: {
          applicationId: data.applicationId,
          provider: data.provider as PrismaProvider,
        },
      },
      create: {
        applicationId: data.applicationId,
        provider: data.provider as PrismaProvider,
        enabled: data.enabled,
        clientId: data.clientId,
        clientSecretEnc: data.clientSecretEnc,
        scopes: data.scopes,
        redirectUri: data.redirectUri,
      },
      update: {
        enabled: data.enabled,
        clientId: data.clientId,
        clientSecretEnc: data.clientSecretEnc,
        scopes: data.scopes,
        redirectUri: data.redirectUri,
      },
    });
    return this.map(row);
  }

  async update(
    id: string,
    data: Partial<Omit<UpsertOAuthProviderRecord, 'applicationId' | 'provider'>>,
  ): Promise<OAuthProviderConfig> {
    const row = await this.prisma.oAuthProviderConfig.update({
      where: { id },
      data: {
        enabled: data.enabled,
        clientId: data.clientId,
        clientSecretEnc: data.clientSecretEnc,
        scopes: data.scopes,
        redirectUri: data.redirectUri,
      },
    });
    return this.map(row);
  }

  async findById(id: string): Promise<OAuthProviderConfig | null> {
    const row = await this.prisma.oAuthProviderConfig.findUnique({
      where: { id },
    });
    return row ? this.map(row) : null;
  }

  async findByApplicationAndProvider(
    applicationId: string,
    provider: OAuthProviderType,
  ): Promise<OAuthProviderConfig | null> {
    const row = await this.prisma.oAuthProviderConfig.findUnique({
      where: {
        applicationId_provider: {
          applicationId,
          provider: provider as PrismaProvider,
        },
      },
    });
    return row ? this.map(row) : null;
  }

  async listByApplication(
    applicationId: string,
  ): Promise<OAuthProviderConfig[]> {
    const rows = await this.prisma.oAuthProviderConfig.findMany({
      where: { applicationId },
      orderBy: { provider: 'asc' },
    });
    return rows.map((row) => this.map(row));
  }

  async listEnabledByApplication(
    applicationId: string,
  ): Promise<OAuthProviderConfig[]> {
    const rows = await this.prisma.oAuthProviderConfig.findMany({
      where: { applicationId, enabled: true },
    });
    return rows.map((row) => this.map(row));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.oAuthProviderConfig.delete({ where: { id } });
  }

  private map(row: PrismaOAuth): OAuthProviderConfig {
    return new OAuthProviderConfig({
      id: row.id,
      applicationId: row.applicationId,
      provider: row.provider as OAuthProviderType,
      enabled: row.enabled,
      clientId: row.clientId,
      clientSecretEnc: row.clientSecretEnc,
      scopes: row.scopes,
      redirectUri: row.redirectUri,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}

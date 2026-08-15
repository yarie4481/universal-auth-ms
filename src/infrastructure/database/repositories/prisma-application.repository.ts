import { Injectable } from '@nestjs/common';
import {
  Application as PrismaApplication,
  ApplicationStatus as PrismaStatus,
  AppEnvironment as PrismaEnv,
  ApplicationType as PrismaType,
} from '@prisma/client';
import { Application } from '../../../domain/entities/application.entity';
import {
  AppEnvironment,
  ApplicationStatus,
  ApplicationType,
} from '../../../domain/enums/application.enums';
import {
  ApplicationRepositoryPort,
  CreateApplicationRecord,
  UpdateApplicationRecord,
} from '../../../domain/repositories/application.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaApplicationRepository implements ApplicationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateApplicationRecord): Promise<Application> {
    const row = await this.prisma.application.create({
      data: {
        name: data.name,
        clientId: data.clientId,
        clientSecretHash: data.clientSecretHash,
        type: data.type as PrismaType,
        environment: data.environment as PrismaEnv,
        redirectUris: data.redirectUris,
        allowedOrigins: data.allowedOrigins,
        allowedProviders: data.allowedProviders,
        allowedScopes: data.allowedScopes,
        status: (data.status ?? ApplicationStatus.active) as PrismaStatus,
      },
    });
    return this.map(row);
  }

  async update(id: string, data: UpdateApplicationRecord): Promise<Application> {
    const row = await this.prisma.application.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type as PrismaType | undefined,
        redirectUris: data.redirectUris,
        allowedOrigins: data.allowedOrigins,
        allowedProviders: data.allowedProviders,
        allowedScopes: data.allowedScopes,
        status: data.status as PrismaStatus | undefined,
        clientSecretHash: data.clientSecretHash,
      },
    });
    return this.map(row);
  }

  async findById(id: string): Promise<Application | null> {
    const row = await this.prisma.application.findUnique({ where: { id } });
    return row ? this.map(row) : null;
  }

  async findByClientId(clientId: string): Promise<Application | null> {
    const row = await this.prisma.application.findUnique({ where: { clientId } });
    return row ? this.map(row) : null;
  }

  async list(filters?: {
    environment?: AppEnvironment;
    status?: ApplicationStatus;
  }): Promise<Application[]> {
    const rows = await this.prisma.application.findMany({
      where: {
        environment: filters?.environment as PrismaEnv | undefined,
        status: filters?.status as PrismaStatus | undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.map(row));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.application.delete({ where: { id } });
  }

  private map(row: PrismaApplication): Application {
    return new Application({
      id: row.id,
      name: row.name,
      clientId: row.clientId,
      clientSecretHash: row.clientSecretHash,
      type: row.type as ApplicationType,
      environment: row.environment as AppEnvironment,
      redirectUris: row.redirectUris,
      allowedOrigins: row.allowedOrigins,
      allowedProviders: row.allowedProviders,
      allowedScopes: row.allowedScopes,
      status: row.status as ApplicationStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}

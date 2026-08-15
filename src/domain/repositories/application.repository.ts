import { Application } from '../../domain/entities/application.entity';
import {
  AppEnvironment,
  ApplicationStatus,
  ApplicationType,
} from '../../domain/enums/application.enums';

export const APPLICATION_REPOSITORY_PORT = Symbol('APPLICATION_REPOSITORY_PORT');

export interface CreateApplicationRecord {
  name: string;
  clientId: string;
  clientSecretHash: string;
  type: ApplicationType;
  environment: AppEnvironment;
  redirectUris: string[];
  allowedOrigins: string[];
  allowedProviders: string[];
  allowedScopes: string[];
  status?: ApplicationStatus;
}

export interface UpdateApplicationRecord {
  name?: string;
  type?: ApplicationType;
  redirectUris?: string[];
  allowedOrigins?: string[];
  allowedProviders?: string[];
  allowedScopes?: string[];
  status?: ApplicationStatus;
  clientSecretHash?: string;
}

export interface ApplicationRepositoryPort {
  create(data: CreateApplicationRecord): Promise<Application>;
  update(id: string, data: UpdateApplicationRecord): Promise<Application>;
  findById(id: string): Promise<Application | null>;
  findByClientId(clientId: string): Promise<Application | null>;
  list(filters?: {
    environment?: AppEnvironment;
    status?: ApplicationStatus;
  }): Promise<Application[]>;
  delete(id: string): Promise<void>;
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { OAuthProviderConfig } from '../../../../domain/entities/oauth-provider-config.entity';
import {
  DeleteOAuthProviderUseCase,
  GetOAuthProviderUseCase,
  ListOAuthProvidersUseCase,
  UpdateOAuthProviderUseCase,
  UpsertOAuthProviderUseCase,
} from '../../../../application/use-cases/providers/provider.use-cases';
import { AdminApiKeyGuard } from '../../guards/admin-api-key.guard';
import { PatchProviderDto, UpsertProviderDto } from '../../dto/admin.dto';

@ApiTags('Admin — Providers')
@ApiSecurity('admin-api-key')
@ApiHeader({ name: 'x-admin-api-key', required: true })
@UseGuards(AdminApiKeyGuard)
@Controller('api/v1/admin')
export class AdminProvidersController {
  constructor(
    private readonly upsertProvider: UpsertOAuthProviderUseCase,
    private readonly listProviders: ListOAuthProvidersUseCase,
    private readonly getProvider: GetOAuthProviderUseCase,
    private readonly updateProvider: UpdateOAuthProviderUseCase,
    private readonly deleteProvider: DeleteOAuthProviderUseCase,
  ) {}

  @Post('applications/:applicationId/providers')
  @ApiOperation({
    summary: 'Configure Google/GitHub OAuth for an application (secret encrypted at rest)',
  })
  async upsert(
    @Param('applicationId') applicationId: string,
    @Body() body: UpsertProviderDto,
  ) {
    const provider = await this.upsertProvider.execute({
      applicationId,
      ...body,
    });
    return toProviderDto(provider);
  }

  @Get('applications/:applicationId/providers')
  @ApiOperation({ summary: 'List OAuth providers for an application' })
  async list(@Param('applicationId') applicationId: string) {
    const items = await this.listProviders.execute(applicationId);
    return { items: items.map(toProviderDto) };
  }

  @Get('providers/:id')
  @ApiOperation({ summary: 'Get provider configuration (secret masked)' })
  async get(@Param('id') id: string) {
    return toProviderDto(await this.getProvider.execute(id));
  }

  @Patch('providers/:id')
  @ApiOperation({ summary: 'Update provider configuration' })
  async update(@Param('id') id: string, @Body() body: PatchProviderDto) {
    return toProviderDto(await this.updateProvider.execute(id, body));
  }

  @Delete('providers/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete provider configuration' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteProvider.execute(id);
  }
}

function toProviderDto(provider: OAuthProviderConfig) {
  const view = provider.toSafeView();
  return {
    id: view.id,
    applicationId: view.applicationId,
    provider: view.provider,
    enabled: view.enabled,
    clientId: view.clientId,
    clientSecret: view.clientSecretMasked,
    scopes: view.scopes,
    redirectUri: view.redirectUri,
    createdAt: view.createdAt.toISOString(),
    updatedAt: view.updatedAt.toISOString(),
  };
}

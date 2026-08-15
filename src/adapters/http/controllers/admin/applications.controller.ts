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
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Application } from '../../../../domain/entities/application.entity';
import {
  AppEnvironment,
  ApplicationStatus,
} from '../../../../domain/enums/application.enums';
import {
  CreateApplicationUseCase,
  DeleteApplicationUseCase,
  GetApplicationUseCase,
  ListApplicationsUseCase,
  RotateApplicationSecretUseCase,
  UpdateApplicationUseCase,
} from '../../../../application/use-cases/applications/application.use-cases';
import { AdminApiKeyGuard } from '../../guards/admin-api-key.guard';
import { CreateApplicationDto, UpdateApplicationDto } from '../../dto/admin.dto';

@ApiTags('Admin — Applications')
@ApiSecurity('admin-api-key')
@ApiHeader({ name: 'x-admin-api-key', required: true })
@UseGuards(AdminApiKeyGuard)
@Controller('api/v1/admin/applications')
export class AdminApplicationsController {
  constructor(
    private readonly createApplication: CreateApplicationUseCase,
    private readonly listApplications: ListApplicationsUseCase,
    private readonly getApplication: GetApplicationUseCase,
    private readonly updateApplication: UpdateApplicationUseCase,
    private readonly deleteApplication: DeleteApplicationUseCase,
    private readonly rotateSecret: RotateApplicationSecretUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create an application (clientId + clientSecret issued once)',
  })
  async create(@Body() body: CreateApplicationDto) {
    const result = await this.createApplication.execute(body);
    return {
      application: toApplicationDto(result.application),
      clientSecret: result.clientSecret,
      warning:
        'Store clientSecret now — it will not be shown again. Only a hash is persisted.',
    };
  }

  @Get()
  @ApiOperation({ summary: 'List applications' })
  async list(
    @Query('environment') environment?: AppEnvironment,
    @Query('status') status?: ApplicationStatus,
  ) {
    const apps = await this.listApplications.execute({ environment, status });
    return { items: apps.map(toApplicationDto) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiOkResponse()
  async get(@Param('id') id: string) {
    return toApplicationDto(await this.getApplication.execute(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update application' })
  async update(@Param('id') id: string, @Body() body: UpdateApplicationDto) {
    return toApplicationDto(await this.updateApplication.execute(id, body));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete application' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteApplication.execute(id);
  }

  @Post(':id/rotate-secret')
  @ApiOperation({ summary: 'Rotate client secret (shown once)' })
  async rotate(@Param('id') id: string) {
    const result = await this.rotateSecret.execute(id);
    return {
      clientSecret: result.clientSecret,
      warning: 'Store the new clientSecret now — it will not be shown again.',
    };
  }
}

function toApplicationDto(app: Application) {
  return {
    id: app.id,
    name: app.name,
    clientId: app.clientId,
    type: app.type,
    environment: app.environment,
    redirectUris: app.redirectUris,
    allowedOrigins: app.allowedOrigins,
    allowedProviders: app.allowedProviders,
    allowedScopes: app.allowedScopes,
    status: app.status,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
  };
}

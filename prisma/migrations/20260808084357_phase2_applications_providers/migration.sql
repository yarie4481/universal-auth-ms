-- CreateEnum
CREATE TYPE "ApplicationType" AS ENUM ('WEB', 'SPA', 'MOBILE', 'BACKEND', 'MACHINE_TO_MACHINE');

-- CreateEnum
CREATE TYPE "AppEnvironment" AS ENUM ('development', 'staging', 'production');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('active', 'disabled');

-- CreateEnum
CREATE TYPE "OAuthProviderType" AS ENUM ('google', 'github');

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecretHash" TEXT NOT NULL,
    "type" "ApplicationType" NOT NULL,
    "environment" "AppEnvironment" NOT NULL,
    "redirectUris" TEXT[],
    "allowedOrigins" TEXT[],
    "allowedProviders" TEXT[],
    "allowedScopes" TEXT[],
    "status" "ApplicationStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_provider_configs" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "provider" "OAuthProviderType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "clientId" TEXT NOT NULL,
    "clientSecretEnc" TEXT NOT NULL,
    "scopes" TEXT[],
    "redirectUri" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_provider_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "applications_clientId_key" ON "applications"("clientId");

-- CreateIndex
CREATE INDEX "applications_environment_idx" ON "applications"("environment");

-- CreateIndex
CREATE UNIQUE INDEX "applications_name_environment_key" ON "applications"("name", "environment");

-- CreateIndex
CREATE INDEX "oauth_provider_configs_applicationId_idx" ON "oauth_provider_configs"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_provider_configs_applicationId_provider_key" ON "oauth_provider_configs"("applicationId", "provider");

-- AddForeignKey
ALTER TABLE "oauth_provider_configs" ADD CONSTRAINT "oauth_provider_configs_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

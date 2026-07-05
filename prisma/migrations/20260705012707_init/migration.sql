-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "aiQuotaUsed" REAL NOT NULL DEFAULT 0,
    "aiQuotaLimit" REAL NOT NULL DEFAULT 5,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Shanghai',
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "primaryPlatform" TEXT,
    "firstPublishAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PlatformAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "encryptedToken" TEXT,
    "errorMessage" TEXT,
    "lastHealthCheck" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlatformAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "platformTargets" TEXT NOT NULL,
    "masterTitle" TEXT NOT NULL DEFAULT '',
    "masterBody" TEXT NOT NULL DEFAULT '',
    "masterTags" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "referenceUrl" TEXT,
    "imagePrompt" TEXT,
    "selectedCoverByPlatform" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContentDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DraftVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "draftId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "source" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DraftVersion_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ContentDraft" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlatformVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "draftId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "bodyHtml" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "coverImageId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlatformVariant_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ContentDraft" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DraftImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "draftId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "prompt" TEXT,
    "platform" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DraftImage_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ContentDraft" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PublishJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "draftTitle" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "scheduledAt" DATETIME,
    "status" TEXT NOT NULL,
    "platformUrl" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PublishJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PublishJob_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ContentDraft" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PublishJob_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "PlatformVariant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PublishJob_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "PlatformAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "PlatformAccount_userId_platform_idx" ON "PlatformAccount"("userId", "platform");

-- CreateIndex
CREATE INDEX "ContentDraft_userId_status_idx" ON "ContentDraft"("userId", "status");

-- CreateIndex
CREATE INDEX "DraftVersion_draftId_createdAt_idx" ON "DraftVersion"("draftId", "createdAt");

-- CreateIndex
CREATE INDEX "PlatformVariant_draftId_idx" ON "PlatformVariant"("draftId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformVariant_draftId_platform_key" ON "PlatformVariant"("draftId", "platform");

-- CreateIndex
CREATE INDEX "DraftImage_draftId_platform_idx" ON "DraftImage"("draftId", "platform");

-- CreateIndex
CREATE INDEX "PublishJob_userId_status_idx" ON "PublishJob"("userId", "status");

-- CreateIndex
CREATE INDEX "PublishJob_draftId_idx" ON "PublishJob"("draftId");

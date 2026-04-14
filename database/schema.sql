-- This file is for reference. Use Prisma migrations to manage schema changes.
-- Run: npm run db:push (from backend directory)

CREATE TABLE "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "phoneNumber" TEXT,
  "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
  "alertCooldownMinutes" INTEGER NOT NULL DEFAULT 30,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL
);

CREATE TABLE "Alert" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "departureAirport" TEXT NOT NULL,
  "arrivalAirport" TEXT NOT NULL,
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP NOT NULL,
  "cabinClasses" TEXT[] NOT NULL,
  airlines TEXT[] NOT NULL,
  "maxMilesCost" INTEGER,
  active BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL,
  "lastChecked" TIMESTAMP
);

CREATE TABLE "AlertMatch" (
  id TEXT PRIMARY KEY,
  "alertId" TEXT NOT NULL REFERENCES "Alert"(id) ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  airline TEXT NOT NULL,
  "departureDate" TIMESTAMP NOT NULL,
  "cabinClass" TEXT NOT NULL,
  "milesCost" INTEGER NOT NULL,
  "availableSeat" BOOLEAN NOT NULL DEFAULT true,
  "notificationSent" BOOLEAN NOT NULL DEFAULT false,
  "notificationTime" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "SearchSession" (
  id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  "departureAirport" TEXT NOT NULL,
  "arrivalAirport" TEXT NOT NULL,
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP NOT NULL,
  "cabinClasses" TEXT[] NOT NULL,
  airlines TEXT[] NOT NULL,
  "maxMilesCost" INTEGER,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "expiresAt" TIMESTAMP NOT NULL DEFAULT (now() + interval '30 minutes')
);

CREATE TABLE "AvailabilityResult" (
  id TEXT PRIMARY KEY,
  "searchSessionId" TEXT NOT NULL REFERENCES "SearchSession"(id) ON DELETE CASCADE,
  airline TEXT NOT NULL,
  "departureDate" TIMESTAMP NOT NULL,
  "departureTime" TEXT,
  "arrivalTime" TEXT,
  "cabinClass" TEXT NOT NULL,
  "milesCost" INTEGER NOT NULL,
  "availableSeats" INTEGER NOT NULL,
  "externalId" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "AirlineAPIKey" (
  id TEXT PRIMARY KEY,
  airline TEXT UNIQUE NOT NULL,
  "apiKey" TEXT NOT NULL,
  "apiBase" TEXT,
  "creditsRemaining" INTEGER,
  "rateLimit" TEXT,
  "lastUpdated" TIMESTAMP NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX "Alert_userId_idx" ON "Alert"("userId");
CREATE INDEX "AlertMatch_alertId_idx" ON "AlertMatch"("alertId");
CREATE INDEX "AlertMatch_userId_idx" ON "AlertMatch"("userId");
CREATE INDEX "SearchSession_userId_idx" ON "SearchSession"("userId");
CREATE INDEX "SearchSession_expiresAt_idx" ON "SearchSession"("expiresAt");
CREATE INDEX "AvailabilityResult_searchSessionId_idx" ON "AvailabilityResult"("searchSessionId");
CREATE INDEX "AvailabilityResult_airline_departureDate_idx" ON "AvailabilityResult"(airline, "departureDate");

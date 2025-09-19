/*
  Warnings:

  - You are about to drop the column `dataType` on the `ApiService` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `ApiService` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "ApiMethod" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "returnType" TEXT NOT NULL,
    "isList" BOOLEAN NOT NULL DEFAULT false,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "documentation" TEXT,
    "serviceId" INTEGER NOT NULL,
    CONSTRAINT "ApiMethod_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ApiService" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiParam" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isList" BOOLEAN NOT NULL DEFAULT false,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "methodId" INTEGER NOT NULL,
    CONSTRAINT "ApiParam_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "ApiMethod" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ApiService" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tsFilePath" TEXT
);
INSERT INTO "new_ApiService" ("baseUrl", "createdAt", "id", "name", "tsFilePath", "updatedAt") SELECT "baseUrl", "createdAt", "id", "name", "tsFilePath", "updatedAt" FROM "ApiService";
DROP TABLE "ApiService";
ALTER TABLE "new_ApiService" RENAME TO "ApiService";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

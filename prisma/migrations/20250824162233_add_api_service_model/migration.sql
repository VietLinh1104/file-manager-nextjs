-- CreateTable
CREATE TABLE "ApiService" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

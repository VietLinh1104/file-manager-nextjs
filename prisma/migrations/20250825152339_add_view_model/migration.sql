-- CreateTable
CREATE TABLE "View" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "apiId" INTEGER NOT NULL,
    "dataTypeId" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "View_apiId_fkey" FOREIGN KEY ("apiId") REFERENCES "ApiService" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "View_dataTypeId_fkey" FOREIGN KEY ("dataTypeId") REFERENCES "DataType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "View_name_key" ON "View"("name");

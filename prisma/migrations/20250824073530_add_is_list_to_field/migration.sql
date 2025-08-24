-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Field" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL,
    "isList" BOOLEAN NOT NULL DEFAULT false,
    "dataTypeId" INTEGER NOT NULL,
    "refBOId" INTEGER,
    CONSTRAINT "Field_dataTypeId_fkey" FOREIGN KEY ("dataTypeId") REFERENCES "DataType" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Field_refBOId_fkey" FOREIGN KEY ("refBOId") REFERENCES "DataType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Field" ("dataTypeId", "id", "name", "refBOId", "required", "type") SELECT "dataTypeId", "id", "name", "refBOId", "required", "type" FROM "Field";
DROP TABLE "Field";
ALTER TABLE "new_Field" RENAME TO "Field";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

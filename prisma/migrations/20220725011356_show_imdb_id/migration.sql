/*
  Warnings:

  - A unique constraint covering the columns `[show_imdb_id]` on the table `Show` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Show"
    ADD COLUMN "show_imdb_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Show_show_imdb_id_key" ON "Show" ("show_imdb_id");

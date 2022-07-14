/*
  Warnings:

  - A unique constraint covering the columns `[shep_sonarr_id]` on the table `ShowEpisode` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ShowEpisode" ADD COLUMN     "shep_sonarr_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ShowEpisode_shep_sonarr_id_key" ON "ShowEpisode"("shep_sonarr_id");

/*
  Warnings:

  - You are about to drop the column `movi_ombi_request_id` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `movi_ombi_request_state` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `movi_ombi_request_title` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `show_ombi_request_id` on the `Show` table. All the data in the column will be lost.
  - You are about to drop the column `show_ombi_request_title` on the `Show` table. All the data in the column will be lost.
  - You are about to drop the column `shep_ombi_request_state` on the `ShowEpisode` table. All the data in the column will be lost.
  - You are about to drop the column `shep_ombi_request_title` on the `ShowEpisode` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[movi_ombi_id]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[show_ombi_id]` on the table `Show` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "OmbiDataState" AS ENUM ('PENDING_APPROVAL', 'DENIED', 'PROCESSING', 'AVAILABLE');

-- DropIndex
DROP INDEX "Movie_movi_ombi_request_id_key";

-- DropIndex
DROP INDEX "Show_show_ombi_request_id_key";

-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "movi_ombi_request_id",
DROP COLUMN "movi_ombi_request_state",
DROP COLUMN "movi_ombi_request_title",
ADD COLUMN     "movi_ombi_background_image" TEXT,
ADD COLUMN     "movi_ombi_id" TEXT,
ADD COLUMN     "movi_ombi_poster_image" TEXT,
ADD COLUMN     "movi_ombi_state" "OmbiDataState",
ADD COLUMN     "movi_ombi_title" TEXT;

-- AlterTable
ALTER TABLE "Show" DROP COLUMN "show_ombi_request_id",
DROP COLUMN "show_ombi_request_title",
ADD COLUMN     "show_ombi_background_image" TEXT,
ADD COLUMN     "show_ombi_id" TEXT,
ADD COLUMN     "show_ombi_poster_image" TEXT,
ADD COLUMN     "show_ombi_title" TEXT;

-- AlterTable
ALTER TABLE "ShowEpisode" DROP COLUMN "shep_ombi_request_state",
DROP COLUMN "shep_ombi_request_title",
ADD COLUMN     "shep_ombi_state" "OmbiDataState",
ADD COLUMN     "shep_ombi_title" TEXT;

-- DropEnum
DROP TYPE "OmbiRequestDataState";

-- CreateIndex
CREATE UNIQUE INDEX "Movie_movi_ombi_id_key" ON "Movie"("movi_ombi_id");

-- CreateIndex
CREATE UNIQUE INDEX "Show_show_ombi_id_key" ON "Show"("show_ombi_id");

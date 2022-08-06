/*
  Warnings:

  - You are about to drop the column `movi_title` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `show_title` on the `Show` table. All the data in the column will be lost.
  - You are about to drop the column `show_title` on the `ShowEpisode` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "movi_title",
ADD COLUMN     "movi_jellyfin_title" TEXT,
ADD COLUMN     "movi_ombi_request_title" TEXT,
ADD COLUMN     "movi_radarr_title" TEXT;

-- AlterTable
ALTER TABLE "Show" DROP COLUMN "show_title",
ADD COLUMN     "show_jellyfin_title" TEXT,
ADD COLUMN     "show_ombi_request_title" TEXT,
ADD COLUMN     "show_sonarr_title" TEXT;

-- AlterTable
ALTER TABLE "ShowEpisode" DROP COLUMN "show_title",
ADD COLUMN     "shep_jellyfin_title" TEXT,
ADD COLUMN     "shep_ombi_request_title" TEXT,
ADD COLUMN     "shep_sonarr_title" TEXT;

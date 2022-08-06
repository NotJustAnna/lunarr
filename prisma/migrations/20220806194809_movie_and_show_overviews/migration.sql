-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "movi_ombi_overview" TEXT,
ADD COLUMN     "movi_radarr_overview" TEXT;

-- AlterTable
ALTER TABLE "Show" ADD COLUMN     "show_ombi_overview" TEXT,
ADD COLUMN     "show_sonarr_overview" TEXT;

-- AlterTable
ALTER TABLE "ShowEpisode" ADD COLUMN     "shep_ombi_overview" TEXT,
ADD COLUMN     "shep_sonarr_overview" TEXT;

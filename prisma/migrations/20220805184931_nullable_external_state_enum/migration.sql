/*
  Warnings:

  - The values [NONE] on the enum `JellyfinDataState` will be removed. If these variants are still used in the database, this will fail.
  - The values [NONE] on the enum `OmbiRequestDataState` will be removed. If these variants are still used in the database, this will fail.
  - The values [NONE] on the enum `RadarrDataState` will be removed. If these variants are still used in the database, this will fail.
  - The values [NONE] on the enum `SonarrDataState` will be removed. If these variants are still used in the database, this will fail.
  - The values [NONE] on the enum `SonarrEpisodeDataState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "JellyfinDataState_new" AS ENUM ('UNAVAILABLE', 'AVAILABLE');
ALTER TABLE "ShowEpisode"
    ALTER COLUMN "shep_jellyfin_state" DROP DEFAULT;
ALTER TABLE "ShowSeason"
    ALTER COLUMN "shse_jellyfin_state" DROP DEFAULT;
ALTER TABLE "Show"
    ALTER COLUMN "show_jellyfin_state" DROP DEFAULT;
ALTER TABLE "Movie"
    ALTER COLUMN "movi_jellyfin_state" DROP DEFAULT;
ALTER TABLE "Movie" ALTER COLUMN "movi_jellyfin_state" TYPE "JellyfinDataState_new" USING ("movi_jellyfin_state"::text::"JellyfinDataState_new");
ALTER TABLE "Show" ALTER COLUMN "show_jellyfin_state" TYPE "JellyfinDataState_new" USING ("show_jellyfin_state"::text::"JellyfinDataState_new");
ALTER TABLE "ShowSeason" ALTER COLUMN "shse_jellyfin_state" TYPE "JellyfinDataState_new" USING ("shse_jellyfin_state"::text::"JellyfinDataState_new");
ALTER TABLE "ShowEpisode" ALTER COLUMN "shep_jellyfin_state" TYPE "JellyfinDataState_new" USING ("shep_jellyfin_state"::text::"JellyfinDataState_new");
ALTER TYPE "JellyfinDataState" RENAME TO "JellyfinDataState_old";
ALTER TYPE "JellyfinDataState_new" RENAME TO "JellyfinDataState";
DROP TYPE "JellyfinDataState_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OmbiRequestDataState_new" AS ENUM ('PENDING_APPROVAL', 'REQUEST_DENIED', 'PROCESSING_REQUEST', 'AVAILABLE');
ALTER TABLE "ShowEpisode"
    ALTER COLUMN "shep_ombi_request_state" DROP DEFAULT;
ALTER TABLE "Movie"
    ALTER COLUMN "movi_ombi_request_state" DROP DEFAULT;
ALTER TABLE "Movie" ALTER COLUMN "movi_ombi_request_state" TYPE "OmbiRequestDataState_new" USING ("movi_ombi_request_state"::text::"OmbiRequestDataState_new");
ALTER TABLE "ShowEpisode" ALTER COLUMN "shep_ombi_request_state" TYPE "OmbiRequestDataState_new" USING ("shep_ombi_request_state"::text::"OmbiRequestDataState_new");
ALTER TYPE "OmbiRequestDataState" RENAME TO "OmbiRequestDataState_old";
ALTER TYPE "OmbiRequestDataState_new" RENAME TO "OmbiRequestDataState";
DROP TYPE "OmbiRequestDataState_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RadarrDataState_new" AS ENUM ('UNMONITORED', 'MONITORED', 'GRABBED', 'AVAILABLE', 'REMOVED');
ALTER TABLE "Movie"
    ALTER COLUMN "movi_radarr_state" DROP DEFAULT;
ALTER TABLE "Movie" ALTER COLUMN "movi_radarr_state" TYPE "RadarrDataState_new" USING ("movi_radarr_state"::text::"RadarrDataState_new");
ALTER TYPE "RadarrDataState" RENAME TO "RadarrDataState_old";
ALTER TYPE "RadarrDataState_new" RENAME TO "RadarrDataState";
DROP TYPE "RadarrDataState_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "SonarrDataState_new" AS ENUM ('UNMONITORED', 'MONITORED');
ALTER TABLE "ShowSeason"
    ALTER COLUMN "shse_sonarr_state" DROP DEFAULT;
ALTER TABLE "Show"
    ALTER COLUMN "show_sonarr_state" DROP DEFAULT;
ALTER TABLE "Show" ALTER COLUMN "show_sonarr_state" TYPE "SonarrDataState_new" USING ("show_sonarr_state"::text::"SonarrDataState_new");
ALTER TABLE "ShowSeason" ALTER COLUMN "shse_sonarr_state" TYPE "SonarrDataState_new" USING ("shse_sonarr_state"::text::"SonarrDataState_new");
ALTER TYPE "SonarrDataState" RENAME TO "SonarrDataState_old";
ALTER TYPE "SonarrDataState_new" RENAME TO "SonarrDataState";
DROP TYPE "SonarrDataState_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "SonarrEpisodeDataState_new" AS ENUM ('UNMONITORED', 'MONITORED', 'GRABBED', 'AVAILABLE', 'REMOVED');
ALTER TABLE "ShowEpisode"
    ALTER COLUMN "shep_sonarr_state" DROP DEFAULT;
ALTER TABLE "ShowEpisode" ALTER COLUMN "shep_sonarr_state" TYPE "SonarrEpisodeDataState_new" USING ("shep_sonarr_state"::text::"SonarrEpisodeDataState_new");
ALTER TYPE "SonarrEpisodeDataState" RENAME TO "SonarrEpisodeDataState_old";
ALTER TYPE "SonarrEpisodeDataState_new" RENAME TO "SonarrEpisodeDataState";
DROP TYPE "SonarrEpisodeDataState_old";
COMMIT;

-- AlterTable
ALTER TABLE "Movie"
    ALTER COLUMN "movi_jellyfin_state" DROP NOT NULL,
ALTER
COLUMN "movi_jellyfin_state" DROP
DEFAULT,
ALTER
COLUMN "movi_radarr_state" DROP
NOT NULL,
ALTER
COLUMN "movi_radarr_state" DROP
DEFAULT,
ALTER
COLUMN "movi_ombi_request_state" DROP
NOT NULL,
ALTER
COLUMN "movi_ombi_request_state" DROP
DEFAULT;

-- AlterTable
ALTER TABLE "Show"
    ALTER COLUMN "show_jellyfin_state" DROP NOT NULL,
ALTER
COLUMN "show_jellyfin_state" DROP
DEFAULT,
ALTER
COLUMN "show_sonarr_state" DROP
NOT NULL,
ALTER
COLUMN "show_sonarr_state" DROP
DEFAULT;

-- AlterTable
ALTER TABLE "ShowEpisode"
    ALTER COLUMN "shep_jellyfin_state" DROP NOT NULL,
ALTER
COLUMN "shep_jellyfin_state" DROP
DEFAULT,
ALTER
COLUMN "shep_sonarr_state" DROP
NOT NULL,
ALTER
COLUMN "shep_sonarr_state" DROP
DEFAULT,
ALTER
COLUMN "shep_ombi_request_state" DROP
NOT NULL,
ALTER
COLUMN "shep_ombi_request_state" DROP
DEFAULT;

-- AlterTable
ALTER TABLE "ShowSeason"
    ALTER COLUMN "shse_jellyfin_state" DROP NOT NULL,
ALTER
COLUMN "shse_jellyfin_state" DROP
DEFAULT,
ALTER
COLUMN "shse_sonarr_state" DROP
NOT NULL,
ALTER
COLUMN "shse_sonarr_state" DROP
DEFAULT;

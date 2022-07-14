-- Enable UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "JellyfinDataState" AS ENUM ('NONE', 'UNAVAILABLE', 'AVAILABLE');

-- CreateEnum
CREATE TYPE "RadarrDataState" AS ENUM ('NONE', 'UNMONITORED', 'MONITORED', 'GRABBED', 'AVAILABLE', 'REMOVED');

-- CreateEnum
CREATE TYPE "SonarrDataState" AS ENUM ('NONE', 'UNMONITORED', 'MONITORED');

-- CreateEnum
CREATE TYPE "SonarrEpisodeDataState" AS ENUM ('NONE', 'UNMONITORED', 'MONITORED', 'GRABBED', 'AVAILABLE', 'REMOVED');

-- CreateEnum
CREATE TYPE "OmbiRequestDataState" AS ENUM ('NONE', 'AWAITING_APPROVAL', 'APPROVED_REQUEST', 'DECLINED_REQUEST', 'PARTIALLY_AVAILABLE', 'AVAILABLE');

-- CreateTable
CREATE TABLE "Movie" (
    "movi_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "movi_created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "movi_title" TEXT,
    "movi_jellyfin_id" TEXT,
    "movi_radarr_id" TEXT,
    "movi_ombi_request_id" TEXT,
    "movi_tmdb_id" TEXT,
    "movi_imdb_id" TEXT,
    "movi_jellyfin_state" "JellyfinDataState" NOT NULL DEFAULT 'NONE',
    "movi_radarr_state" "RadarrDataState" NOT NULL DEFAULT 'NONE',

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("movi_id")
);

-- CreateTable
CREATE TABLE "MovieAudioTrack" (
    "moat_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "moat_created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moat_title" TEXT NOT NULL,
    "moat_codec" TEXT NOT NULL,
    "moat_language" TEXT NOT NULL,
    "moat_channels" TEXT NOT NULL,
    "moat_bitrate" TEXT NOT NULL,
    "moat_sample_rate" TEXT NOT NULL,
    "movi_id" UUID NOT NULL,

    CONSTRAINT "MovieAudioTrack_pkey" PRIMARY KEY ("moat_id")
);

-- CreateTable
CREATE TABLE "MovieVideoTrack" (
    "movt_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "movt_created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "movt_title" TEXT NOT NULL,
    "movt_aspect_ratio" TEXT NOT NULL,
    "movt_codec" TEXT NOT NULL,
    "movt_color_space" TEXT NOT NULL,
    "movt_interlaced" BOOLEAN NOT NULL,
    "movt_height" TEXT NOT NULL,
    "movt_width" TEXT NOT NULL,
    "movt_range" TEXT NOT NULL,
    "movi_id" UUID NOT NULL,

    CONSTRAINT "MovieVideoTrack_pkey" PRIMARY KEY ("movt_id")
);

-- CreateTable
CREATE TABLE "MovieSubtitleTrack" (
    "most_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "most_created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "most_title" TEXT NOT NULL,
    "most_codec" TEXT NOT NULL,
    "most_language" TEXT NOT NULL,
    "most_external" BOOLEAN NOT NULL,
    "most_forced" BOOLEAN NOT NULL,
    "movi_id" UUID NOT NULL,

    CONSTRAINT "MovieSubtitleTrack_pkey" PRIMARY KEY ("most_id")
);

-- CreateTable
CREATE TABLE "Show" (
    "show_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "show_created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "show_title" TEXT,
    "show_jellyfin_id" TEXT,
    "show_sonarr_id" TEXT,
    "show_ombi_request_id" TEXT,
    "show_tvdb_id" TEXT,
    "show_tvrage_id" TEXT,
    "show_tvmaze_id" TEXT,
    "show_jellyfin_state" "JellyfinDataState" NOT NULL DEFAULT 'NONE',
    "show_sonarr_state" "SonarrDataState" NOT NULL DEFAULT 'NONE',

    CONSTRAINT "Show_pkey" PRIMARY KEY ("show_id")
);

-- CreateTable
CREATE TABLE "ShowSeason" (
    "shse_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "shse_number" INTEGER NOT NULL,
    "shse_created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shse_jellyfin_id" TEXT,
    "shse_jellyfin_state" "JellyfinDataState" NOT NULL DEFAULT 'NONE',
    "shse_sonarr_state" "SonarrDataState" NOT NULL DEFAULT 'NONE',
    "show_id" UUID NOT NULL,

    CONSTRAINT "ShowSeason_pkey" PRIMARY KEY ("shse_id")
);

-- CreateTable
CREATE TABLE "ShowEpisode" (
    "shep_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "shep_number" INTEGER NOT NULL,
    "shep_created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shep_jellyfin_id" TEXT,
    "shep_jellyfin_state" "JellyfinDataState" NOT NULL DEFAULT 'NONE',
    "shep_sonarr_state" "SonarrEpisodeDataState" NOT NULL DEFAULT 'NONE',
    "shep_ombi_request_state" "OmbiRequestDataState" NOT NULL DEFAULT 'NONE',
    "shse_id" UUID NOT NULL,

    CONSTRAINT "ShowEpisode_pkey" PRIMARY KEY ("shep_id")
);

-- CreateTable
CREATE TABLE "EpisodeAudioTrack" (
    "epat_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "epat_created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "epat_title" TEXT NOT NULL,
    "epat_codec" TEXT NOT NULL,
    "epat_language" TEXT NOT NULL,
    "epat_channels" TEXT NOT NULL,
    "epat_bitrate" TEXT NOT NULL,
    "epat_sample_rate" TEXT NOT NULL,
    "shep_id" UUID NOT NULL,

    CONSTRAINT "EpisodeAudioTrack_pkey" PRIMARY KEY ("epat_id")
);

-- CreateTable
CREATE TABLE "EpisodeVideoTrack" (
    "epvt_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "epvt_created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "epvt_title" TEXT NOT NULL,
    "epvt_aspect_ration" TEXT NOT NULL,
    "epvt_codec" TEXT NOT NULL,
    "epvt_color_space" TEXT NOT NULL,
    "epvt_interlaced" BOOLEAN NOT NULL,
    "epvt_height" TEXT NOT NULL,
    "epvt_width" TEXT NOT NULL,
    "epvt_range" TEXT NOT NULL,
    "shep_id" UUID NOT NULL,

    CONSTRAINT "EpisodeVideoTrack_pkey" PRIMARY KEY ("epvt_id")
);

-- CreateTable
CREATE TABLE "EpisodeSubtitleTrack" (
    "epst_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "epst_created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "epst_title" TEXT NOT NULL,
    "epst_codec" TEXT NOT NULL,
    "epst_language" TEXT NOT NULL,
    "epst_external" BOOLEAN NOT NULL,
    "epst_forced" BOOLEAN NOT NULL,
    "shep_id" UUID NOT NULL,

    CONSTRAINT "EpisodeSubtitleTrack_pkey" PRIMARY KEY ("epst_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Movie_movi_jellyfin_id_key" ON "Movie"("movi_jellyfin_id");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_movi_radarr_id_key" ON "Movie"("movi_radarr_id");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_movi_ombi_request_id_key" ON "Movie"("movi_ombi_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_movi_tmdb_id_key" ON "Movie"("movi_tmdb_id");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_movi_imdb_id_key" ON "Movie"("movi_imdb_id");

-- CreateIndex
CREATE UNIQUE INDEX "Show_show_jellyfin_id_key" ON "Show"("show_jellyfin_id");

-- CreateIndex
CREATE UNIQUE INDEX "Show_show_sonarr_id_key" ON "Show"("show_sonarr_id");

-- CreateIndex
CREATE UNIQUE INDEX "Show_show_ombi_request_id_key" ON "Show"("show_ombi_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "Show_show_tvdb_id_key" ON "Show"("show_tvdb_id");

-- CreateIndex
CREATE UNIQUE INDEX "Show_show_tvrage_id_key" ON "Show"("show_tvrage_id");

-- CreateIndex
CREATE UNIQUE INDEX "Show_show_tvmaze_id_key" ON "Show"("show_tvmaze_id");

-- CreateIndex
CREATE UNIQUE INDEX "ShowSeason_shse_jellyfin_id_key" ON "ShowSeason"("shse_jellyfin_id");

-- CreateIndex
CREATE UNIQUE INDEX "ShowSeason_show_id_shse_number_key" ON "ShowSeason"("show_id", "shse_number");

-- CreateIndex
CREATE UNIQUE INDEX "ShowEpisode_shep_jellyfin_id_key" ON "ShowEpisode"("shep_jellyfin_id");

-- CreateIndex
CREATE UNIQUE INDEX "ShowEpisode_shse_id_shep_number_key" ON "ShowEpisode"("shse_id", "shep_number");

-- AddForeignKey
ALTER TABLE "MovieAudioTrack" ADD CONSTRAINT "MovieAudioTrack_movi_id_fkey" FOREIGN KEY ("movi_id") REFERENCES "Movie"("movi_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieVideoTrack" ADD CONSTRAINT "MovieVideoTrack_movi_id_fkey" FOREIGN KEY ("movi_id") REFERENCES "Movie"("movi_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieSubtitleTrack" ADD CONSTRAINT "MovieSubtitleTrack_movi_id_fkey" FOREIGN KEY ("movi_id") REFERENCES "Movie"("movi_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowSeason" ADD CONSTRAINT "ShowSeason_show_id_fkey" FOREIGN KEY ("show_id") REFERENCES "Show"("show_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowEpisode" ADD CONSTRAINT "ShowEpisode_shse_id_fkey" FOREIGN KEY ("shse_id") REFERENCES "ShowSeason"("shse_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodeAudioTrack" ADD CONSTRAINT "EpisodeAudioTrack_shep_id_fkey" FOREIGN KEY ("shep_id") REFERENCES "ShowEpisode"("shep_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodeVideoTrack" ADD CONSTRAINT "EpisodeVideoTrack_shep_id_fkey" FOREIGN KEY ("shep_id") REFERENCES "ShowEpisode"("shep_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodeSubtitleTrack" ADD CONSTRAINT "EpisodeSubtitleTrack_shep_id_fkey" FOREIGN KEY ("shep_id") REFERENCES "ShowEpisode"("shep_id") ON DELETE RESTRICT ON UPDATE CASCADE;

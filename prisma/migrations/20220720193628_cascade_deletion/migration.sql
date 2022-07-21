-- DropForeignKey
ALTER TABLE "EpisodeAudioTrack" DROP CONSTRAINT "EpisodeAudioTrack_shep_id_fkey";

-- DropForeignKey
ALTER TABLE "EpisodeSubtitleTrack" DROP CONSTRAINT "EpisodeSubtitleTrack_shep_id_fkey";

-- DropForeignKey
ALTER TABLE "EpisodeVideoTrack" DROP CONSTRAINT "EpisodeVideoTrack_shep_id_fkey";

-- DropForeignKey
ALTER TABLE "MovieAudioTrack" DROP CONSTRAINT "MovieAudioTrack_movi_id_fkey";

-- DropForeignKey
ALTER TABLE "MovieSubtitleTrack" DROP CONSTRAINT "MovieSubtitleTrack_movi_id_fkey";

-- DropForeignKey
ALTER TABLE "MovieVideoTrack" DROP CONSTRAINT "MovieVideoTrack_movi_id_fkey";

-- DropForeignKey
ALTER TABLE "ShowEpisode" DROP CONSTRAINT "ShowEpisode_shse_id_fkey";

-- DropForeignKey
ALTER TABLE "ShowSeason" DROP CONSTRAINT "ShowSeason_show_id_fkey";

-- AddForeignKey
ALTER TABLE "MovieAudioTrack"
    ADD CONSTRAINT "MovieAudioTrack_movi_id_fkey" FOREIGN KEY ("movi_id") REFERENCES "Movie" ("movi_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieVideoTrack"
    ADD CONSTRAINT "MovieVideoTrack_movi_id_fkey" FOREIGN KEY ("movi_id") REFERENCES "Movie" ("movi_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieSubtitleTrack"
    ADD CONSTRAINT "MovieSubtitleTrack_movi_id_fkey" FOREIGN KEY ("movi_id") REFERENCES "Movie" ("movi_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowSeason"
    ADD CONSTRAINT "ShowSeason_show_id_fkey" FOREIGN KEY ("show_id") REFERENCES "Show" ("show_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowEpisode"
    ADD CONSTRAINT "ShowEpisode_shse_id_fkey" FOREIGN KEY ("shse_id") REFERENCES "ShowSeason" ("shse_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodeAudioTrack"
    ADD CONSTRAINT "EpisodeAudioTrack_shep_id_fkey" FOREIGN KEY ("shep_id") REFERENCES "ShowEpisode" ("shep_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodeVideoTrack"
    ADD CONSTRAINT "EpisodeVideoTrack_shep_id_fkey" FOREIGN KEY ("shep_id") REFERENCES "ShowEpisode" ("shep_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodeSubtitleTrack"
    ADD CONSTRAINT "EpisodeSubtitleTrack_shep_id_fkey" FOREIGN KEY ("shep_id") REFERENCES "ShowEpisode" ("shep_id") ON DELETE CASCADE ON UPDATE CASCADE;

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as process from 'process';
import { Movie } from './entity/Movie';
import { Show } from './entity/Show';
import { ShowSeason } from './entity/ShowSeason';
import { ShowEpisode } from './entity/ShowEpisode';
import { EpisodeAudioTrack } from './entity/jellyfin/EpisodeAudioTrack';
import { EpisodeSubtitleTrack } from './entity/jellyfin/EpisodeSubtitleTrack';
import { EpisodeVideoTrack } from './entity/jellyfin/EpisodeVideoTrack';
import { MovieAudioTrack } from './entity/jellyfin/MovieAudioTrack';
import { MovieSubtitleTrack } from './entity/jellyfin/MovieSubtitleTrack';
import { MovieVideoTrack } from './entity/jellyfin/MovieVideoTrack';

export const FlixDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST!,
  port: 5432,
  username: process.env.POSTGRES_USER!,
  password: process.env.POSTGRES_PASSWORD!,
  database: process.env.POSTGRES_DB!,
  synchronize: true,
  logging: false,
  entities: [
    Movie, Show, ShowSeason, ShowEpisode,
    EpisodeAudioTrack, EpisodeSubtitleTrack, EpisodeVideoTrack,
    MovieAudioTrack, MovieSubtitleTrack, MovieVideoTrack,
  ],
  migrations: [],
  subscribers: [],
});

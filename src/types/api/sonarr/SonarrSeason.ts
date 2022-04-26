export interface SonarrSeason {
  seasonNumber: number;
  monitored: boolean;
  statistics: SeasonStatistics;
}

export interface SeasonStatistics {
  previousAiring: string;
  episodeFileCount: number;
  episodeCount: number;
  totalEpisodeCount: number;
  sizeOnDisk: number;
  percentOfEpisodes: number;
}

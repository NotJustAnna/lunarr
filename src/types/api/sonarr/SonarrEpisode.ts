export interface SonarrEpisode {
  seriesId: number;
  episodeFileId: number;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  hasFile: boolean;
  monitored: boolean;
  unverifiedSceneNumbering: boolean;
  id: number;
  airDate?: string;
  airDateUtc?: string;
  overview?: string;
  absoluteEpisodeNumber?: number;
  sceneAbsoluteEpisodeNumber?: number;
  sceneEpisodeNumber?: number;
  sceneSeasonNumber?: number;
}

import { SonarrSeasonStatistics } from './SonarrSeasonStatistics';

export interface SonarrSeason {
  seasonNumber: number;
  monitored: boolean;
  statistics: SonarrSeasonStatistics;
}

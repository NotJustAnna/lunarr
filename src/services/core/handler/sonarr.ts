import { SonarrSeries } from '../../../types/api/sonarr/GetSeries';
import { Episode, Season, Show } from '../data/show';
import { SonarrEpisode } from '../../../types/api/sonarr/SonarrEpisode';
import axios from 'axios';
import { FlixDatabase } from '../database';
import { JellyfinState, OmbiRequestState, SonarrState } from '../data/enums';
import { createLogger } from '../../../utils/logger';

export class SonarrHandler {
  private static readonly logger = createLogger('SonarrHandler');

  private readonly url = process.env.SONARR_URL!;
  private readonly apiKey = process.env.SONARR_API_KEY!;

  constructor(private readonly database: FlixDatabase) {}

  async sync() {
    SonarrHandler.logger.info('Syncing Sonarr data...');

    const seriesResponse = await axios.get<SonarrSeries[]>(`${this.url}/api/series`, {
      headers: {
        'X-Api-key': this.apiKey,
      },
    });
    SonarrHandler.logger.info(`Found ${seriesResponse.data.length} series`);

    await Promise.all(seriesResponse.data.map(async (series) => {
      SonarrHandler.logger.info(`Syncing Sonarr series "${series.title}"`);
      const episodesPromise = axios.get<SonarrEpisode[]>(`${this.url}/api/episode?seriesId=${series.id}`, {
        headers: {
          'X-Api-key': this.apiKey,
        },
      });

      const show = this.database.shows.getBySonarrId(String(series.id))
        ?? this.database.shows.getByTvdbId(String(series.tvdbId))
        ?? this.database.shows.getByTvMazeId(String(series.tvMazeId))
        ?? this.database.shows.getByTvRageId(String(series.tvRageId))
        ?? this.createShowFromSeries(series);

      let episodesResponse = await episodesPromise;
      SonarrHandler.logger.info(`Found ${episodesResponse.data.length} episodes for series "${series.title}"`);
      this.updateShowEpisodesFromSonarr(show, episodesResponse.data);

      SonarrHandler.logger.info(`Syncing Sonarr series "${series.title}" complete, saving...`);
      this.database.shows.save(show);
      SonarrHandler.logger.info(`Sonarr series "${series.title}" updated!`);
    }));
    SonarrHandler.logger.info('Sonarr sync complete!');
  }

  private createShowFromSeries(series: SonarrSeries): Show {
    return {
      id: this.database.shows.newId(),
      sonarrId: String(series.id),
      tvdbId: String(series.tvdbId),
      tvMazeId: String(series.tvMazeId),
      tvRageId: String(series.tvRageId),
      title: series.title,
      seasons: series.seasons.map((season) => {
        return {
          number: season.seasonNumber,
          episodes: [],
          // TODO Add Sonarr-specific season stats and monitored value
        }
      }),
    }
  }

  private updateShowEpisodesFromSonarr(show: Show, episodes: SonarrEpisode[]) {
    for (const sonarrEpisode of episodes) {
      let season = show.seasons.find(season => season.number === sonarrEpisode.seasonNumber);
      if (!season) {
        const newSeason: Season = {
          number: sonarrEpisode.seasonNumber,
          episodes: [],
        };
        show.seasons.push(newSeason);
        season = newSeason;
      }

      let episode = season.episodes.find(e => e.number === sonarrEpisode.episodeNumber);
      if (episode) {
        episode.title = sonarrEpisode.title;
      } else {
        const newEpisode: Episode = {
          number: sonarrEpisode.episodeNumber,
          title: sonarrEpisode.title,
          jellyfinState: JellyfinState.NONE,
          ombiRequestState: OmbiRequestState.NONE,
          sonarrState: sonarrEpisode.monitored ? sonarrEpisode.hasFile ? SonarrState.IMPORTED : SonarrState.MONITORED : SonarrState.UNMONITORED,
          // TODO Add Sonarr-specific episode stats
        };
        season.episodes.push(newEpisode);
      }
    }
  }
}

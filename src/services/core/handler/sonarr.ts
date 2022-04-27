import { SonarrEpisode } from '../../../types/sonarr/api/SonarrEpisode';
import axios from 'axios';
import { createLogger } from '../../../utils/logger';
import { SonarrSeries } from '../../../types/sonarr/api/SonarrSeries';
import { DataSource, Repository } from 'typeorm';
import { Show } from '../../../database/entity/Show';
import { ShowSeason } from '../../../database/entity/ShowSeason';
import { ShowEpisode } from '../../../database/entity/ShowEpisode';
import { SonarrState } from '../../../database/enums/sonarrState';
import { SonarrEpisodeState } from '../../../database/enums/sonarrEpisodeState';

export class SonarrHandler {
  private static readonly logger = createLogger('SonarrHandler');

  private readonly url = process.env.SONARR_URL!;
  private readonly apiKey = process.env.SONARR_API_KEY!;

  private showRepository: Repository<Show>;
  private seasonRepository: Repository<ShowSeason>;
  private episodeRepository: Repository<ShowEpisode>;

  constructor(private readonly database: DataSource) {
    this.showRepository = this.database.getRepository(Show);
    this.seasonRepository = this.database.getRepository(ShowSeason);
    this.episodeRepository = this.database.getRepository(ShowEpisode);
  }

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

      const [show, episodesResponse] = await Promise.all([this.updateShows(series), episodesPromise]);
      SonarrHandler.logger.info(`Found ${episodesResponse.data.length} episodes for series "${series.title}"`);
      await this.updateEpisodes(show.id, episodesResponse.data);
      SonarrHandler.logger.info(`Sonarr series "${series.title}" updated!`);
    }));
    SonarrHandler.logger.info('Sonarr sync complete!');
  }

  private async updateShows(series: SonarrSeries): Promise<Show> {
    const show = await this.showRepository.findOne({
      where: [
        {
          sonarrId: String(series.id),
        },
        {
          tvdbId: String(series.tvdbId),
        },
        {
          tvMazeId: String(series.tvMazeId),
        },
        {
          tvRageId: String(series.tvRageId),
        },
      ],
    });

    if (!show) {
      const newShow = new Show();
      newShow.sonarrId = String(series.id);
      if (series.tvdbId && series.tvdbId !== 0) {
        newShow.tvdbId = String(series.tvdbId);
      }
      if (series.tvMazeId && series.tvMazeId !== 0) {
        newShow.tvMazeId = String(series.tvMazeId);
      }
      if (series.tvRageId && series.tvRageId !== 0) {
        newShow.tvRageId = String(series.tvRageId);
      }
      newShow.title = series.title;
      newShow.sonarrState = series.monitored ? SonarrState.MONITORED : SonarrState.UNMONITORED;
      await this.showRepository.save(newShow);
      await Promise.all(series.seasons.map(async (s) => {
        const season = new ShowSeason();
        season.showId = newShow.id;
        season.seasonNumber = s.seasonNumber;
        season.sonarrState = s.monitored ? SonarrState.MONITORED : SonarrState.UNMONITORED;
        await this.seasonRepository.save(season);
      }));
      return newShow;
    }

    // TODO Update show and/or seasons
    return show;
  }

  private async updateEpisodes(showId: string, sonarrEpisodes: SonarrEpisode[]) {
    for (const sonarrEpisode of sonarrEpisodes) {
      const season = await this.getOrCreateStubSeason(showId, sonarrEpisode.seasonNumber);

      const episode = await this.episodeRepository.findOneBy({
        seasonId: season.id,
        episodeNumber: sonarrEpisode.episodeNumber,
      });

      if (!episode) {
        const newEpisode = new ShowEpisode();
        newEpisode.seasonId = season.id;
        newEpisode.episodeNumber = sonarrEpisode.episodeNumber;
        newEpisode.title = sonarrEpisode.title;
        newEpisode.sonarrId = String(sonarrEpisode.id);
        newEpisode.sonarrState = sonarrEpisode.monitored ?
          (sonarrEpisode.hasFile ? SonarrEpisodeState.IMPORTED : SonarrEpisodeState.MONITORED)
          : SonarrEpisodeState.UNMONITORED;
        await this.episodeRepository.save(newEpisode);
        continue;
      }

      // TODO Update episode
    }
  }

  private async getOrCreateStubSeason(showId: string, seasonNumber: number): Promise<ShowSeason> {
    const season = await this.seasonRepository.findOneBy({ showId, seasonNumber });

    if (season) {
      return season;
    }

    const newSeason = new ShowSeason();
    newSeason.showId = showId;
    newSeason.seasonNumber = seasonNumber;
    return this.seasonRepository.save(newSeason);
  }

  async handleSync(data: any) {

  }
}

import { createLogger } from '../../../utils/logger';
import { DataSource, Repository } from 'typeorm';
import { Show } from '../../../database/entity/Show';
import { ShowSeason } from '../../../database/entity/ShowSeason';
import { ShowEpisode } from '../../../database/entity/ShowEpisode';
import { TvRequest } from '../../../types/ombi/api/GetTvRequests';

export class OmbiTvHandler {
  private static readonly logger = createLogger('OmbiTvHandler');

  private showRepository: Repository<Show>;
  private seasonRepository: Repository<ShowSeason>;
  private episodeRepository: Repository<ShowEpisode>;

  constructor(private readonly database: DataSource) {
    this.showRepository = this.database.getRepository(Show);
    this.seasonRepository = this.database.getRepository(ShowSeason);
    this.episodeRepository = this.database.getRepository(ShowEpisode);
  }

  async sync(requests: TvRequest[]) {
  }
}

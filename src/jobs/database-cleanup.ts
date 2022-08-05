import { AbstractJob } from '@/app/jobs';
import { ShowsRepository } from '@/repositories/shows';
import { ShowSeasonsRepository } from '@/repositories/showSeasons';
import { ShowEpisodesRepository } from '@/repositories/showEpisodes';
import { MoviesRepository } from '@/repositories/movies';
import { createLogger } from '@/app/logger';

export class DatabaseCleanupJob extends AbstractJob {
  private static readonly logger = createLogger('DatabaseCleanupJob');

  constructor(
    private readonly shows: ShowsRepository,
    private readonly showSeasons: ShowSeasonsRepository,
    private readonly showEpisodes: ShowEpisodesRepository,
    private readonly movies: MoviesRepository,
  ) {
    super({
      id: 'database-cleanup',
      name: 'Database cleanup',
      interval: { days: 1 },
    });
  }

  async run() {
    const result = await Promise.all([
      this.shows.deleteUntracked(),
      this.showSeasons.deleteUntracked(),
      this.showEpisodes.deleteUntracked(),
      this.movies.deleteUntracked(),
    ]);

    const total = result.reduce((acc, cur) => acc + cur.count, 0);
    const report = total > 0 ? `Cleaned up ${total === 1 ? '1 objects' : `${total} objects`}` : 'No objects cleaned up';
    DatabaseCleanupJob.logger.info(`(Task) Database cleanup finished. ${report}`);
  }
}

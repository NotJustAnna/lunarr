import { Service } from 'typedi';
import { ShowsRepository } from '@/repositories/shows';
import { ShowSeasonsRepository } from '@/repositories/showSeasons';
import { ShowEpisodesRepository } from '@/repositories/showEpisodes';
import { MoviesRepository } from '@/repositories/movies';
import { JobService } from '@/services/jobs';
import { DatabaseCleanupJob } from '@/jobs/database-cleanup';

@Service()
export class DatabaseInitializer {
  constructor(
    private readonly shows: ShowsRepository,
    private readonly showSeasons: ShowSeasonsRepository,
    private readonly showEpisodes: ShowEpisodesRepository,
    private readonly movies: MoviesRepository,
    private readonly jobs: JobService,
  ) {
    this.jobs.add(
      new DatabaseCleanupJob(
        this.shows,
        this.showSeasons,
        this.showEpisodes,
        this.movies,
      ),
    );
  }
}

import { createLogger } from '../../../utils/logger';
import { DataSource, Repository } from 'typeorm';
import { Movie } from '../../../database/entity/Movie';
import { RadarrMovie } from '../../../types/radarr/api/RadarrMovie';
import { RadarrState } from '../../../database/enums/radarrState';

export class RadarrHandler {
  private static readonly logger = createLogger('RadarrHandler');

  private movieRepository: Repository<Movie>;

  constructor(private readonly database: DataSource) {
    this.movieRepository = this.database.getRepository(Movie);
  }

  async sync(movies: RadarrMovie[]) {
    return Promise.all(movies.map(this.createOrUpdateMovie.bind(this)));
  }

  private async createOrUpdateMovie(m: RadarrMovie) {
    const movie = await this.movieRepository.findOne({
      where: [
        { radarrId: String(m.id) },
        { tmdbId: String(m.tmdbId) },
        { imdbId: m.imdbId },
      ],
    });

    if (!movie) {
      const newMovie = new Movie();
      newMovie.radarrId = String(m.id);
      if (m.tmdbId && m.tmdbId !== 0) {
        newMovie.tmdbId = String(m.tmdbId);
      }
      if (m.imdbId && m.imdbId !== '0') {
        newMovie.imdbId = m.imdbId;
      }
      newMovie.title = m.title;
      newMovie.radarrState = m.monitored ?
        (m.hasFile ? RadarrState.AVAILABLE : RadarrState.MONITORED)
        : RadarrState.UNMONITORED;
      await this.movieRepository.save(newMovie);
      return;
    }

    // TODO Update movie
  }
}

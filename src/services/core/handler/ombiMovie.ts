import { createLogger } from '../../../utils/logger';
import { DataSource, Repository } from 'typeorm';
import { Movie } from '../../../database/entity/Movie';
import { MovieRequest } from '../../../types/ombi/api/GetMovieRequests';

export class OmbiMovieHandler {
  private static readonly logger = createLogger('OmbiMovieHandler');

  private movieRepository: Repository<Movie>;

  constructor(private readonly database: DataSource) {
    this.movieRepository = this.database.getRepository(Movie);
  }

  async sync(requests: MovieRequest[]) {
  }
}

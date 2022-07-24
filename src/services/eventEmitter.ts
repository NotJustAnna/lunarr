import { Service } from 'typedi';
import { Movie } from '@/prisma-client';

@Service()
export class EventEmitterService {
  constructor() {}

  async fromMovieChanges(movie: Movie, changes: Partial<Movie>) {

  }

  async fromNewMovie(movie: Movie) {

  }
}

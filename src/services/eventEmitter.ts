import { Service } from 'typedi';
import { Movie, Show, ShowEpisode, ShowSeason } from '@prisma/client';

@Service()
export class EventEmitterService {
  constructor() {}

  async fromMovieChanges(movie: Movie, changes: Partial<Movie>) {

  }

  async fromNewMovie(movie: Movie) {

  }

  async fromShowChanges(show: Show, changes: Partial<Show>) {

  }

  async fromNewShow(newShow: Show) {

  }

  async fromShowSeasonChanges(show: ShowSeason, changes: Partial<ShowSeason>) {

  }

  async fromNewShowSeason(newShow: ShowSeason) {

  }

  async fromShowEpisodeChanges(show: ShowEpisode, changes: Partial<ShowEpisode>) {

  }

  async fromNewShowEpisode(newShow: ShowEpisode) {

  }
}

import { Service } from 'typedi';
import { Movie, Show, ShowEpisode, ShowSeason } from '@prisma/client';
import { microDiff } from '@/utils/microDiff';
import { EventService } from '@/services/events/index';

@Service()
export class ChangeSetService {
  constructor(
    private readonly eventService: EventService,
  ) {}

  async fromMovieChanges(movie: Movie, changes: Partial<Movie>) {
    const diff = microDiff(movie, changes);
    if (!diff) {
      return;
    }

    this.eventService.emit('movie.updated', {
      movie: diff.applied,
      oldValues: diff.old,
      newValues: diff.new,
    });
  }

  async fromNewMovie(movie: Movie) {
    this.eventService.emit('movie.created', { movie });
  }

  async fromShowChanges(show: Show, changes: Partial<Show>) {
    const diff = microDiff(show, changes);
    if (!diff) {
      return;
    }

    this.eventService.emit('show.updated', {
      show: diff.applied,
      oldValues: diff.old,
      newValues: diff.new,
    });
  }

  async fromNewShow(newShow: Show) {
    this.eventService.emit('show.created', { show: newShow });
  }

  async fromShowSeasonChanges(showSeason: ShowSeason, changes: Partial<ShowSeason>) {
    const diff = microDiff(showSeason, changes);
    if (!diff) {
      return;
    }

    this.eventService.emit('show.season.updated', {
      showSeason: diff.applied,
      oldValues: diff.old,
      newValues: diff.new,
    });
  }

  async fromNewShowSeason(newShowSeason: ShowSeason) {
    this.eventService.emit('show.season.created', { showSeason: newShowSeason });
  }

  async fromShowEpisodeChanges(showEpisode: ShowEpisode, changes: Partial<ShowEpisode>) {
    const diff = microDiff(showEpisode, changes);
    if (!diff) {
      return;
    }

    this.eventService.emit('show.episode.updated', {
      showEpisode: diff.applied,
      oldValues: diff.old,
      newValues: diff.new,
    });
  }

  async fromNewShowEpisode(newShowEpisode: ShowEpisode) {
    this.eventService.emit('show.episode.created', { showEpisode: newShowEpisode });
  }
}

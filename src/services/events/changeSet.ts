import { Service } from 'typedi';
import { Movie, Show, ShowEpisode, ShowSeason } from '@prisma/client';
import { microDiff } from '@/utils/microDiff';
import { EventService } from '@/services/events/index';

@Service()
export class ChangeSetService {
  constructor(
    private readonly eventService: EventService,
  ) {}

  fromMovieChanges(movie: Movie, changes: Partial<Movie>) {
    const diff = microDiff(movie, changes);
    if (!diff) {
      return;
    }

    this.eventService.emit('movieUpdated', {
      movie: diff.applied,
      oldValues: diff.old,
      newValues: diff.new,
    });
  }

  fromNewMovie(movie: Movie) {
    this.eventService.emit('movieCreated', { movie });
  }

  fromShowChanges(show: Show, changes: Partial<Show>) {
    const diff = microDiff(show, changes);
    if (!diff) {
      return;
    }

    this.eventService.emit('showUpdated', {
      show: diff.applied,
      oldValues: diff.old,
      newValues: diff.new,
    });
  }

  fromNewShow(newShow: Show) {
    this.eventService.emit('showCreated', { show: newShow });
  }

  fromShowSeasonChanges(showSeason: ShowSeason, changes: Partial<ShowSeason>) {
    const diff = microDiff(showSeason, changes);
    if (!diff) {
      return;
    }

    this.eventService.emit('showSeasonUpdated', {
      showSeason: diff.applied,
      oldValues: diff.old,
      newValues: diff.new,
    });
  }

  fromNewShowSeason(newShowSeason: ShowSeason) {
    this.eventService.emit('showSeasonCreated', { showSeason: newShowSeason });
  }

  fromShowEpisodeChanges(showEpisode: ShowEpisode, changes: Partial<ShowEpisode>) {
    const diff = microDiff(showEpisode, changes);
    if (!diff) {
      return;
    }

    this.eventService.emit('showEpisodeUpdated', {
      showEpisode: diff.applied,
      oldValues: diff.old,
      newValues: diff.new,
    });
  }

  fromNewShowEpisode(newShowEpisode: ShowEpisode) {
    this.eventService.emit('showEpisodeCreated', { showEpisode: newShowEpisode });
  }
}

import { Movie, Show, ShowEpisode, ShowSeason } from '@prisma/client';

export interface Events {
  all: GenericEvent;

  movieCreated: MovieCreatedEvent;
  movieUpdated: MovieUpdatedEvent;
  movieDeleted: MovieDeletedEvent;

  showCreated: ShowCreatedEvent;
  showUpdated: ShowUpdatedEvent;
  showDeleted: ShowDeletedEvent;

  showSeasonCreated: ShowSeasonCreatedEvent;
  showSeasonUpdated: ShowSeasonUpdatedEvent;
  showSeasonDeleted: ShowSeasonDeletedEvent;

  showEpisodeCreated: ShowEpisodeCreatedEvent;
  showEpisodeUpdated: ShowEpisodeUpdatedEvent;
  showEpisodeDeleted: ShowEpisodeDeletedEvent;
}

export const EventTypes = {
  all: 'all',

  movieCreated: 'movieCreated',
  movieUpdated: 'movieUpdated',
  movieDeleted: 'movieDeleted',

  showCreated: 'showCreated',
  showUpdated: 'showUpdated',
  showDeleted: 'showDeleted',

  showSeasonCreated: 'showSeasonCreated',
  showSeasonUpdated: 'showSeasonUpdated',
  showSeasonDeleted: 'showSeasonDeleted',

  showEpisodeCreated: 'showEpisodeCreated',
  showEpisodeUpdated: 'showEpisodeUpdated',
  showEpisodeDeleted: 'showEpisodeDeleted',
};

export interface GenericEvent<T extends Exclude<keyof Events, 'all'> = Exclude<keyof Events, 'all'>> {
  event: T;
  data: Events[T];
}

export interface MovieCreatedEvent {
  movie: Movie;
}

export interface MovieUpdatedEvent {
  movie: Movie;
  oldValues: Partial<Movie>;
  newValues: Partial<Movie>;
}

export interface MovieDeletedEvent {
  movie: Movie;
}

export interface ShowCreatedEvent {
  show: Show;
}

export interface ShowUpdatedEvent {
  show: Show;
  oldValues: Partial<Show>;
  newValues: Partial<Show>;
}

export interface ShowDeletedEvent {
  show: Show;
}

export interface ShowSeasonCreatedEvent {
  showSeason: ShowSeason;
}

export interface ShowSeasonUpdatedEvent {
  showSeason: ShowSeason;
  oldValues: Partial<ShowSeason>;
  newValues: Partial<ShowSeason>;
}

export interface ShowSeasonDeletedEvent {
  showSeason: ShowSeason;
}

export interface ShowEpisodeCreatedEvent {
  showEpisode: ShowEpisode;
}

export interface ShowEpisodeUpdatedEvent {
  showEpisode: ShowEpisode;
  oldValues: Partial<ShowEpisode>;
  newValues: Partial<ShowEpisode>;
}

export interface ShowEpisodeDeletedEvent {
  showEpisode: ShowEpisode;
}

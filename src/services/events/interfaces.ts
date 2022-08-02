import { Movie, Show, ShowEpisode, ShowSeason } from '@prisma/client';

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

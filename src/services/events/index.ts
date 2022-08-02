import { EventEmitter } from 'events';
import {
  MovieCreatedEvent,
  MovieUpdatedEvent,
  ShowCreatedEvent,
  ShowDeletedEvent,
  ShowEpisodeCreatedEvent,
  ShowEpisodeDeletedEvent,
  ShowEpisodeUpdatedEvent,
  ShowSeasonCreatedEvent,
  ShowSeasonDeletedEvent,
  ShowSeasonUpdatedEvent,
  ShowUpdatedEvent,
} from '@/services/events/interfaces';
import { Service } from 'typedi';

@Service()
export class EventService {
  private readonly eventEmitter = new EventEmitter();

  constructor() {}

  on(event: 'movie.created', listener: (data: MovieCreatedEvent) => void): void;
  on(event: 'movie.updated', listener: (data: MovieUpdatedEvent) => void): void;
  on(event: 'show.created', listener: (data: ShowCreatedEvent) => void): void;
  on(event: 'show.updated', listener: (data: ShowUpdatedEvent) => void): void;
  on(event: 'show.deleted', listener: (data: ShowDeletedEvent) => void): void;
  on(event: 'show.season.created', listener: (data: ShowSeasonCreatedEvent) => void): void;
  on(event: 'show.season.updated', listener: (data: ShowSeasonUpdatedEvent) => void): void;
  on(event: 'show.season.deleted', listener: (data: ShowSeasonDeletedEvent) => void): void;
  on(event: 'show.episode.created', listener: (data: ShowEpisodeCreatedEvent) => void): void;
  on(event: 'show.episode.updated', listener: (data: ShowEpisodeUpdatedEvent) => void): void;
  on(event: 'show.episode.deleted', listener: (data: ShowEpisodeDeletedEvent) => void): void;
  on(event: 'all', listener: (event: string, data: any) => void): void;
  on(event: string, listener: (data: any) => void): void;
  on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  off(event: 'movie.created', listener: (data: MovieCreatedEvent) => void): void;
  off(event: 'movie.updated', listener: (data: MovieUpdatedEvent) => void): void;
  off(event: 'show.created', listener: (data: ShowCreatedEvent) => void): void;
  off(event: 'show.updated', listener: (data: ShowUpdatedEvent) => void): void;
  off(event: 'show.deleted', listener: (data: ShowDeletedEvent) => void): void;
  off(event: 'show.season.created', listener: (data: ShowSeasonCreatedEvent) => void): void;
  off(event: 'show.season.updated', listener: (data: ShowSeasonUpdatedEvent) => void): void;
  off(event: 'show.season.deleted', listener: (data: ShowSeasonDeletedEvent) => void): void;
  off(event: 'show.episode.created', listener: (data: ShowEpisodeCreatedEvent) => void): void;
  off(event: 'show.episode.updated', listener: (data: ShowEpisodeUpdatedEvent) => void): void;
  off(event: 'show.episode.deleted', listener: (data: ShowEpisodeDeletedEvent) => void): void;
  off(event: 'all', listener: (event: string, data: any) => void): void;
  off(event: string, listener: (data: any) => void): void;
  off(event: string, listener: (...args: any[]) => void) {
    this.eventEmitter.off(event, listener);
  }

  once(event: 'movie.created', listener: (data: MovieCreatedEvent) => void): void;
  once(event: 'movie.updated', listener: (data: MovieUpdatedEvent) => void): void;
  once(event: 'show.created', listener: (data: ShowCreatedEvent) => void): void;
  once(event: 'show.updated', listener: (data: ShowUpdatedEvent) => void): void;
  once(event: 'show.deleted', listener: (data: ShowDeletedEvent) => void): void;
  once(event: 'show.season.created', listener: (data: ShowSeasonCreatedEvent) => void): void;
  once(event: 'show.season.updated', listener: (data: ShowSeasonUpdatedEvent) => void): void;
  once(event: 'show.season.deleted', listener: (data: ShowSeasonDeletedEvent) => void): void;
  once(event: 'show.episode.created', listener: (data: ShowEpisodeCreatedEvent) => void): void;
  once(event: 'show.episode.updated', listener: (data: ShowEpisodeUpdatedEvent) => void): void;
  once(event: 'show.episode.deleted', listener: (data: ShowEpisodeDeletedEvent) => void): void;
  once(event: 'all', listener: (event: string, data: any) => void): void;
  once(event: string, listener: (data: any) => void): void;
  once(event: string, listener: (...args: any[]) => void) {
    this.eventEmitter.once(event, listener);
  }

  emit(event: 'movie.created', data: MovieCreatedEvent): void;
  emit(event: 'movie.updated', data: MovieUpdatedEvent): void;
  emit(event: 'show.created', data: ShowCreatedEvent): void;
  emit(event: 'show.updated', data: ShowUpdatedEvent): void;
  emit(event: 'show.deleted', data: ShowDeletedEvent): void;
  emit(event: 'show.season.created', data: ShowSeasonCreatedEvent): void;
  emit(event: 'show.season.updated', data: ShowSeasonUpdatedEvent): void;
  emit(event: 'show.season.deleted', data: ShowSeasonDeletedEvent): void;
  emit(event: 'show.episode.created', data: ShowEpisodeCreatedEvent): void;
  emit(event: 'show.episode.updated', data: ShowEpisodeUpdatedEvent): void;
  emit(event: 'show.episode.deleted', data: ShowEpisodeDeletedEvent): void;
  emit(event: string, data: any): void;
  emit(event: string, data: any) {
    this.eventEmitter.emit(event, data);
    this.eventEmitter.emit('all', event, data);
  }
}

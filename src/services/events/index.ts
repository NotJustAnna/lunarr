import { EventEmitter } from 'events';
import { Events, GenericEvent } from '@/services/events/interfaces';
import { Service } from 'typedi';
import { Awaitable } from '@/utils/types';
import { createLogger } from '@/app/logger';

@Service()
export class EventService {
  private static readonly logger = createLogger(EventService.name);

  private readonly eventEmitter = new EventEmitter();

  constructor() {}

  on<K extends keyof Events>(event: K, listener: (data: Events[K]) => Awaitable): this;
  on<S extends string | symbol>(event: Exclude<S, keyof Events>, listener: (data: any) => Awaitable): this;
  on(event: string, listener: (data: any) => Awaitable): this {
    this.eventEmitter.on(event, listener);
    return this;
  }

  off<K extends keyof Events>(event: K, listener: (data: Events[K]) => Awaitable): this;
  off<S extends string | symbol>(event: Exclude<S, keyof Events>, listener: (data: any) => Awaitable): this;
  off(event: string, listener: (data: any) => Awaitable): this {
    this.eventEmitter.off(event, listener);
    return this;
  }

  once<K extends keyof Events>(event: K, listener: (data: Events[K]) => Awaitable): this;
  once<S extends string | symbol>(event: Exclude<S, keyof Events>, listener: (data: any) => Awaitable): this;
  once(event: string, listener: (data: any) => Awaitable): this {
    this.eventEmitter.once(event, listener);
    return this;
  }

  emit<K extends Exclude<keyof Events, 'all'>>(event: K, data: Events[K]): this;
  emit<S extends string | symbol>(event: Exclude<S, keyof Events>, data: any): this;
  emit(event: string, data: any): this {
    this.eventEmitter.emit(event, data);
    this.eventEmitter.emit('all', { event, data } as GenericEvent);
    return this;
  }
}

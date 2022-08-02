import { EventService } from '@/services/events';

type SyncEventListener = (...args: any[]) => void;
type AsyncEventListener = (...args: any[]) => Promise<void>;
const _registrations = Symbol('_registrations');

export abstract class EventListenerService {
  private [_registrations]?: ((eventService: EventService) => void)[];

  protected constructor(protected eventService: EventService) {
    if (this[_registrations]) {
      for (const registration of this[_registrations]) {
        registration(eventService);
      }
      delete this[_registrations];
    }
  }

  static Register(event: string) {
    // Method decorator
    return <S extends EventListenerService, L extends SyncEventListener | AsyncEventListener>(
      target: S, key: string, descriptor: TypedPropertyDescriptor<L>,
    ) => {
      if (!target[_registrations]) {
        target[_registrations] = [];
      }
      target[_registrations].push((eventService: EventService) => {
        eventService.on(event, descriptor.value!.bind(target));
      });
    };
  }
}

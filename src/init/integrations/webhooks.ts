import { ListenerService } from '@/services/events/listener';
import { GenericEvent } from '@/services/events/interfaces';
import { singleton } from 'tsyringe';

@singleton()
export class WebhooksIntegration {
  constructor(eventListener: ListenerService) {
    eventListener.registerBuiltinListeners(this);
  }

  @ListenerService.RegisterBuiltin('all')
  async allEvents(event: GenericEvent) {

  }
}

import { Service } from 'typedi';
import { ListenerService } from '@/services/events/listener';
import { GenericEvent } from '@/services/events/interfaces';

@Service()
export class WebhooksIntegration {
  constructor(eventListener: ListenerService) {
    eventListener.registerBuiltinListeners(this);
  }

  @ListenerService.RegisterBuiltin('all')
  async allEvents(event: GenericEvent) {

  }
}

import { Service } from 'typedi';
import { EventListenerService } from '@/utils/eventListenerService';
import { EventService } from '@/services/events';

@Service()
export class WebhooksIntegration extends EventListenerService {
  constructor(eventService: EventService) {
    super(eventService);
  }

  @EventListenerService.Register('all')
  async allEvents(event: string, data: object) {

  }
}

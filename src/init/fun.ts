import { ListenerService } from '@/services/events/listener';
import { BatchingUtil } from '@/utils/batching';
import { GenericEvent } from '@/services/events/interfaces';
import { singleton } from 'tsyringe';

@singleton()
export class FunInitializer {
  constructor(eventListener: ListenerService) {
    eventListener.registerBuiltinListeners(this);
  }

  private readonly batchingUtil = new BatchingUtil<true>(5000, 0);

  @ListenerService.RegisterBuiltin('all')
  async allEvents(event: GenericEvent) {
    // A bit of fun.
    // This is a easy way to see how many events get fired in a row.
    const batch = await this.batchingUtil.aggregate(true);
    if (!batch) return;
    console.log(`C-COMBO BREAKER! Count: ${batch.length}`);
  }
}

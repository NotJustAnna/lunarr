import { createLogger } from '../../common/logger';
import { MessageSender, Subsystem } from '../../common/worker';

export class FlixController implements Subsystem {
  private static readonly logger = createLogger('FlixController');

  constructor(private readonly send: MessageSender) {
    FlixController.logger.info(`FlixController initialized, awaiting messages from other subsystems...`);
  }

  async onMessage(message: any) {
    console.log(message);
  }
}

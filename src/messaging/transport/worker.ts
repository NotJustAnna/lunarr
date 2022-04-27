import { MessageTransport } from './index';
import { createLogger } from '../../utils/logger';
import { Worker } from 'worker_threads';
import { IncomingPacket, OutgoingPacket } from '../packet';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { Message } from '../messages';

/*
 * IMPLEMENTATION NOTES:
 * The "incoming" and "outgoing" packets are purposefully reversed in order to align with the ParentPortTransport.
 */
export class WorkerTransport implements MessageTransport {
  private static readonly logger = createLogger('WorkerTransport');
  private callback?: (name: string, message: Message) => void;
  private setup = false;

  constructor(private readonly worker: Worker) {
  }

  onMessage(callback?: (name: string, message: Message) => void): void {
    this.callback = callback;
    if (!this.setup && callback) {
      this.setup = true;
      this.worker.on('message', (message: any) => {
        let outgoingPacket: OutgoingPacket;
        try {
          outgoingPacket = plainToInstance(OutgoingPacket, message as object);
        } catch (error) {
          WorkerTransport.logger.error(`Failed to parse outgoing packet`, { error, message });
          return;
        }
        if (this.callback) {
          this.callback(outgoingPacket.recipient, outgoingPacket.message);
        }
      });
    }
  }

  send(name: string, message: Message): void {
    this.worker.postMessage(instanceToPlain(new IncomingPacket({ sender: name, message })));
  }
}

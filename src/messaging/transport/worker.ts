import { MessageTransport } from './index';
import { createLogger } from '../../utils/logger';
import { Worker } from 'worker_threads';
import { MessagePacket } from '../packet';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { Message } from '../messages';

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
        let packet: MessagePacket;
        try {
          packet = plainToInstance(MessagePacket, message as object);
        } catch (error) {
          WorkerTransport.logger.error(`Failed to parse outgoing packet`, { error, message });
          return;
        }
        if (this.callback) {
          this.callback(packet.name, packet.message);
        }
      });
    }
  }

  send(name: string, message: Message): void {
    this.worker.postMessage(instanceToPlain(new MessagePacket({ name, message })));
  }
}

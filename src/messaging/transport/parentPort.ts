import { parentPort } from '../../utils/workers';
import { MessageTransport } from './index';
import { IncomingPacket, OutgoingPacket } from '../packet';
import { MessagePort } from 'worker_threads';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { createLogger } from '../../utils/logger';
import { Message } from '../messages';

export class ParentPortTransport implements MessageTransport {
  private static readonly logger = createLogger('ParentPortMessageTransport');

  private port: MessagePort;
  private callback?: (name: string, message: Message) => void;
  private setup = false;

  constructor() {
    this.port = parentPort(ParentPortTransport.logger);
  }

  onMessage(callback?: (name: string, message: Message) => void) {
    this.callback = callback;
    if (!this.setup && callback) {
      this.setup = true;
      this.port.on('message', (message: any) => {
        let incomingPacket: IncomingPacket;
        try {
          incomingPacket = plainToInstance(IncomingPacket, message as object);
        } catch (error) {
          ParentPortTransport.logger.error(`Failed to parse incoming packet`, { error, message });
          return;
        }
        if (this.callback) {
          this.callback(incomingPacket.sender, incomingPacket.message);
        }
      });
    }
  }

  send(name: string, message: Message) {
    this.port.postMessage(instanceToPlain(new OutgoingPacket({ recipient: name, message })));
  }
}

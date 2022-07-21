import { parentPort } from '../../utils/workers';
import { MessageTransport } from './index';
import { MessagePacket } from '../packet';
import { MessagePort } from 'worker_threads';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { createLogger } from '../../logger';
import { LogMessage, Message } from '../messages';
import { SimpleLogger } from '../../logger/SimpleLogger';

export class ParentPortTransport implements MessageTransport {
  private static readonly logger = createLogger('ParentPortMessageTransport');

  private port: MessagePort;
  private callback?: (name: string, message: Message) => void;
  private setup = false;

  constructor(forwardLogs?: boolean) {
    this.port = parentPort(ParentPortTransport.logger);
    if (forwardLogs) {
      SimpleLogger.stdout = arg => this.send('@log', new LogMessage(arg));
    }
  }

  onMessage(callback?: (name: string, message: Message) => void) {
    this.callback = callback;
    if (!this.setup && callback) {
      this.setup = true;
      this.port.on('message', (message: any) => {
        let packet: MessagePacket;
        try {
          packet = plainToInstance(MessagePacket, message as object);
        } catch (error) {
          ParentPortTransport.logger.error(`Failed to parse incoming packet`, { error, message });
          return;
        }
        if (this.callback) {
          this.callback(packet.name, packet.message);
        }
      });
    }
  }

  send(name: string, message: Message) {
    this.port.postMessage(instanceToPlain(new MessagePacket({ name, message })));
  }
}

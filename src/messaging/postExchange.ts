import { MessageTransport } from './transport';
import { createLogger } from '../utils/logger';
import { PacketConsumer } from './packet/types';
import { Message } from './messages';

export class PostExchange {
  private static logger = createLogger('PostExchange');
  private transports: Record<string, MessageTransport> = {};
  private endpoints: Record<string, PacketConsumer> = {};

  registerTransport(name: string, transport: MessageTransport) {
    if (name in this.transports) {
      PostExchange.logger.warn(`Transport ${name} already registered.`);
      return;
    }
    if (name.startsWith('@')) {
      PostExchange.logger.warn(`Transport ${name} cannot start with '@'.`);
      return;
    }
    transport.onMessage((recipient, message) => this.sendMessage(name, recipient, message));
    this.transports[name] = transport;
  }

  registerEndpoint(name: string, endpoint: PacketConsumer) {
    if (name in this.endpoints) {
      PostExchange.logger.warn(`Endpoint ${name} already registered.`);
      return;
    }
    if (!name.startsWith('@')) {
      PostExchange.logger.warn(`Endpoint ${name} must start with '@'.`);
      return;
    }
    this.endpoints[name] = endpoint;
  }

  registeredTransports(): string[] {
    return Object.keys(this.transports);
  }

  registeredEndpoints(): string[] {
    return Object.keys(this.endpoints);
  }

  removeTransport(name: string) {
    if (name.startsWith('@')) {
      PostExchange.logger.warn(`Transport ${name} cannot start with '@'.`);
      return;
    }
    if (!(name in this.transports)) {
      PostExchange.logger.warn(`Transport ${name} not registered.`);
      return;
    }
    this.transports[name].onMessage(undefined);
    delete this.transports[name];
  }

  removeEndpoint(name: string) {
    if (!name.startsWith('@')) {
      PostExchange.logger.warn(`Endpoint ${name} must start with '@'.`);
      return;
    }
    if (!(name in this.endpoints)) {
      PostExchange.logger.warn(`Endpoint ${name} not registered.`);
      return;
    }
    delete this.endpoints[name];
  }

  sendMessage(sender: string, recipient: string, message: Message) {
    if (recipient.startsWith('@')) {
      if (recipient in this.endpoints) {
        this.endpoints[recipient](sender, message);
        return;
      }
      PostExchange.logger.warn(`Endpoint ${recipient} not registered.`);
      return;
    }
    if (recipient in this.transports) {
      this.transports[recipient].send(sender, message);
      return;
    }
    PostExchange.logger.warn(`Recipient ${recipient} not registered.`);
  }
}

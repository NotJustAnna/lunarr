import { MessageTransport } from './transport';
import { createLogger } from '../utils/logger';
import { PacketConsumer } from './packet/types';
import { Message } from './messages';

export class PostExchange {
  private static logger = createLogger('PostExchange');
  private transports: Record<string, MessageTransport> = {};
  private endpoints: Record<string, PacketConsumer> = {};

  registerTransport(name: string, transport: MessageTransport) {
    if (name.length === 0) {
      PostExchange.logger.warn(`Transport to be registered must not be empty.`);
      return;
    }
    if (name[0] === '@') {
      PostExchange.logger.warn(`Transport ${name} cannot start with '@'.`);
      return;
    }
    if (name in this.transports) {
      PostExchange.logger.warn(`Transport ${name} already registered.`);
      return;
    }
    transport.onMessage((recipient, message) => this.sendMessage(name, recipient, message));
    this.transports[name] = transport;
  }

  registerEndpoint(name: string, endpoint: PacketConsumer) {
    if (name.length === 0) {
      PostExchange.logger.warn(`Endpoint to be registered must not be empty.`);
      return;
    }
    if (name[0] !== '@') {
      PostExchange.logger.warn(`Endpoint ${name} must start with '@'.`);
      return;
    }
    if (name in this.endpoints) {
      PostExchange.logger.warn(`Endpoint ${name} already registered.`);
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
    if (name.length === 0) {
      PostExchange.logger.warn(`Transport to be registered must not be empty.`);
      return;
    }
    if (name[0] === '@') {
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
    if (name.length === 0) {
      PostExchange.logger.warn(`Transport to be registered must not be empty.`);
      return;
    }
    if (name[0] !== '@') {
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
    if (sender.length === 0) {
      PostExchange.logger.warn(`Sender must not be empty.`);
      return;
    }
    if (recipient.length === 0) {
      PostExchange.logger.warn(`Recipient must not be empty.`);
      return;
    }
    if (recipient[0] === '@') {
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

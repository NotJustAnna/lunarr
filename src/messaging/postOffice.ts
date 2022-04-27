import { MessageTransport } from './transport';
import { ErrorMessage, Message, Reply } from './messages';
import { PacketRouter } from './packet/router';
import { ClassConstructor } from 'class-transformer';
import { MessageReceiver, PacketReceiver, ReplyReceiver, Result } from './packet/types';
import {
  ServiceStartedMessage,
  ServiceStoppedMessage,
  StartServiceMessage,
  StopServiceMessage,
} from './messages/services';
import { ServiceStart } from '../utils/init/ServiceStart';

export class PostOffice {
  private router = new PacketRouter();

  constructor(private transport: MessageTransport) {
    transport.onMessage(this.router.route.bind(this.router));
  }

  // shorthand methods

  public startServices(services: ServiceStart[]) {
    this.send('@start', new StartServiceMessage(services));
  }

  public stopServices(...services: string[]) {
    this.send('@stop', new StopServiceMessage(services));
  }

  public async onServiceStart(name: string): Promise<void> {
    await this.firstFrom('@start', m => m instanceof ServiceStartedMessage && m.serviceName === name);
  }

  public async awaitServiceStop(name: string): Promise<void> {
    await this.firstFrom('@stop', m => m instanceof ServiceStoppedMessage && m.serviceName === name);
  }

  public sendError(error: any) {
    this.transport.send('@error', new ErrorMessage(error));
  }

  // generic methods

  public send(recipient: string, message: Message): void {
    this.transport.send(recipient, message);
  }

  public firstType<T extends Message>(type: ClassConstructor<T>, from?: string): Promise<T> {
    return new Promise<T>((resolve) => {
      this.router.registerByType<T>(type, (sender, message) => {
        if (from && sender === from) {
          resolve(message);
          return Result.Unsubscribe;
        }
        return Result.Continue;
      });
    });
  }

  public ofType<T extends Message>(type: ClassConstructor<T>, receiver: PacketReceiver<T>) {
    this.router.registerByType<T>(type, receiver);
  }

  public firstReply(from: string, messageId: string): Promise<Reply> {
    return new Promise((resolve) => {
      this.router.registerByReply(from, messageId, (reply) => {
        resolve(reply);
        return Result.Unsubscribe;
      });
    });
  }

  public ofReply(from: string, messageId: string, receiver: ReplyReceiver) {
    this.router.registerByReply(from, messageId, receiver);
  }

  public firstFrom(from: string, predicate?: (message: Message) => boolean): Promise<Message> {
    return new Promise((resolve) => {
      this.router.registerBySender(from, (message) => {
        if (!(predicate && !predicate(message))) {
          resolve(message);
          return Result.Unsubscribe;
        }
        return Result.Continue;
      });
    });
  }

  public ofSender(from: string, receiver: MessageReceiver) {
    this.router.registerBySender(from, receiver);
  }

  public first(predicate?: (sender: string, message: Message) => boolean): Promise<Message> {
    return new Promise((resolve) => {
      this.router.register((sender, message) => {
        if (!predicate || predicate(sender, message)) {
          resolve(message);
          return Result.Unsubscribe;
        }
        return Result.Continue;
      });
    });
  }

  public of(receiver: PacketReceiver): void {
    this.router.register(receiver);
  }

}

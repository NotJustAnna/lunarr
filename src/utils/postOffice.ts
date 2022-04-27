import { MessageSender } from './init/worker';
import { v4 } from 'uuid';
import deepEqual from 'deep-equal';

type MessagePredicate<T> = (source: string, data: any, nonce?: any) => boolean;

export class PostOffice {
  private awaiting: MessagePredicate<any>[] = [];

  constructor(private readonly sendFn: MessageSender) {}

  send<T>(destination: string, message: any): Promise<T> {
    const nonce = v4();
    const response = this.awaitByNonce<T>(destination, nonce);
    this.sendFn(destination, message, nonce);
    return response;
  }

  sendNoReply(source: string, data: any, nonce?: any) {
    this.sendFn(source, data, nonce);
  }

  route<T>(predicate: MessagePredicate<T>) {
    this.awaiting.push(predicate);
  }

  awaitByMessage<T = any>(from: string, message: any): Promise<T> {
    return this.awaitBy((source, data) => {
      return source === from && deepEqual(message, data);
    });
  }

  awaitByNonce<T = any>(from: string, nonce: any): Promise<T> {
    return this.awaitBy((source, data, nonce) => {
      return source === from && nonce === nonce;
    });
  }

  awaitBy<T = any>(func: MessagePredicate<any>): Promise<T> {
    return new Promise<T>((resolve) => {
      this.awaiting.push((source, data, nonce) => {
        let matched = func(source, data, nonce);
        if (matched) {
          resolve(data);
        }
        return matched;
      });
    });
  }

  messageIncoming(source: string, data: any, nonce?: any) {
    this.awaiting = this.awaiting.filter(func => !func(source, data, nonce));
  }
}

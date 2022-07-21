import { Message } from '../messages';

export interface MessageTransport {
  send(name: string, message: Message): void;

  onMessage(callback?: (name: string, message: Message) => void): void;
}

import { Message, Reply } from '../messages';

export enum Result {
  Continue,
  Unsubscribe
}

export type PacketConsumer = (sender: string, message: Message) => void;

export type PacketReceiver<T = Message> = (sender: string, message: T) => Result | null | undefined; // default: Unsubscribe

export type MessageReceiver = (message: Message) => Result | null | undefined; // default: Unsubscribe

export type ReplyReceiver = (reply: Reply) => Result | null | undefined; // default: Unsubscribe

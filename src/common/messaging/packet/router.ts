import { MessageReceiver, PacketReceiver, ReplyReceiver, Result } from './types';
import { ClassConstructor } from 'class-transformer';
import { Message, Reply } from '../messages';

export class PacketRouter {
  private awaitingReply: Record<string, ReplyReceiver[]> = {};
  private awaitingSender: Record<string, MessageReceiver[]> = {};
  private awaitingType: Record<string, TypeHandler[]> = {};
  private awaitingPacket: PacketReceiver[] = [];

  register(receiver: PacketReceiver) {
    this.awaitingPacket.push(receiver);
  }

  registerByType<T extends Message>(type: ClassConstructor<T>, receiver: PacketReceiver<T>) {
    if (!this.awaitingType[type.name]) {
      this.awaitingType[type.name] = [{ type, receivers: [receiver as PacketReceiver] }];
    } else {
      const handlers = this.awaitingType[type.name];
      let typeHandler = handlers.find(h => h.type === type);
      if (typeHandler) {
        typeHandler.receivers.push(receiver as PacketReceiver);
      } else {
        handlers.push({ type, receivers: [receiver as PacketReceiver] });
      }
    }
  }

  registerBySender(sender: string, receiver: MessageReceiver) {
    if (!this.awaitingSender[sender]) {
      this.awaitingSender[sender] = [receiver];
    } else {
      this.awaitingSender[sender].push(receiver);
    }
  }

  registerByReply(sender: string, id: string, receiver: ReplyReceiver) {
    const addr = `${sender},${id}`;
    if (!this.awaitingReply[addr]) {
      this.awaitingReply[addr] = [receiver];
    } else {
      this.awaitingReply[addr].push(receiver);
    }
  }

  route(sender: string, message: Message) {
    if (message instanceof Reply) {
      this.routeReplies(sender, message);
    }
    this.routeSenders(sender, message);
    this.routeTypes(sender, message);
    this.routePackets(sender, message);
  }

  private routeReplies(sender: string, reply: Reply) {
    const addr = `${sender},${reply.replyTo}`;
    const receivers = this.awaitingReply[addr];
    if (!receivers) {
      return;
    }
    const keep = receivers.filter((receiver) => receiver(reply) === Result.Continue);
    if (keep.length === 0) {
      delete this.awaitingReply[addr];
    } else {
      this.awaitingReply[addr] = keep;
    }
  }

  private routeSenders(sender: string, message: Message) {
    const receivers = this.awaitingSender[sender];
    if (!receivers) {
      return;
    }
    const keep = receivers.filter((receiver) => receiver(message) === Result.Continue);
    if (keep.length === 0) {
      delete this.awaitingSender[sender];
    } else {
      this.awaitingSender[sender] = keep;
    }
  }

  private routeTypes(sender: string, message: Message) {
    const type = message.constructor.name;
    const handlers = this.awaitingType[type];
    if (!handlers) {
      return;
    }
    const entry = handlers.find(({ type }) => message instanceof type);
    if (!entry) {
      return;
    }
    const keep = entry.receivers.filter((receiver) => receiver(sender, message) === Result.Continue);
    if (keep.length === 0) {
      const filtered = handlers.filter(e => e !== entry);
      if (filtered.length === 0) {
        delete this.awaitingType[type];
      } else {
        this.awaitingType[type] = filtered;
      }
    } else {
      entry.receivers = keep;
    }
  }

  private routePackets(sender: string, message: Message) {
    this.awaitingPacket = this.awaitingPacket.filter((receiver) => receiver(sender, message) === Result.Continue);
  }
}

interface TypeHandler {
  type: ClassConstructor<Message>;
  receivers: PacketReceiver[];
}

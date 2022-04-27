import 'reflect-metadata';
import { Message } from '../messages';
import { Type } from 'class-transformer';
import * as allMessages from '../messages/all';

export abstract class MessagePacket {
  @Type(() => Message, {
    discriminator: {
      property: '_type',
      subTypes: Object.values(allMessages).map(value => ({
        name: value.name, value,
      })),
    },
  })
  message!: Message;
}

export class IncomingPacket extends MessagePacket {
  sender!: string;

  constructor(props?: IncomingPacket) {
    super();
    if (props) {
      Object.assign(this, props);
    }
  }
}

export class OutgoingPacket extends MessagePacket {
  recipient!: string;

  constructor(props?: OutgoingPacket) {
    super();
    if (props) {
      Object.assign(this, props);
    }
  }
}

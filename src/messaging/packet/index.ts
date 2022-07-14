import 'reflect-metadata';
import { Message } from '../messages';
import { Type } from 'class-transformer';
import * as allMessages from '../messages/all';

export class MessagePacket {
  @Type(() => Message, {
    discriminator: {
      property: '_type',
      subTypes: Object.values(allMessages).map(value => ({
        name: value.name, value,
      })),
    },
  })
  message!: Message;
  name!: string;

  constructor(props?: MessagePacket) {
    if (props) {
      Object.assign(this, props);
    }
  }
}

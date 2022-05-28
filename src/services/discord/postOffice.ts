import { PostOffice } from '../../messaging/postOffice';
import { MessageTransport } from '../../messaging/transport';
import { InitFlatAssocMessage, InitFlatAssocReply } from '../../messaging/messages/flatAssoc';

export class DiscordPostOffice extends PostOffice {
  constructor(transport: MessageTransport) {
    super(transport);
  }

  public initFlatAssocFlow(discordUserId: string) {
    const message = new InitFlatAssocMessage(discordUserId);
    const reply = this.firstReply('core', message.id);
    this.send('core', message);
    return reply.then(reply => {
      if (reply instanceof InitFlatAssocReply) {
        return reply.link;
      }
      throw new Error(`Expected reply to be of type InitFlatAssocReply, received ${reply.constructor.name}`);
    });
  }
}

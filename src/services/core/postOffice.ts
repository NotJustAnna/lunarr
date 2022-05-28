import { PostOffice } from '../../messaging/postOffice';
import { MessageTransport } from '../../messaging/transport';
import { InitFlatAssocMessage, InitFlatAssocReply } from '../../messaging/messages/flatAssoc';

export class CorePostOffice extends PostOffice {
  constructor(transport: MessageTransport) {
    super(transport);
  }
}

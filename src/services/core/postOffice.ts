import { PostOffice } from '@/common/messaging/postOffice';
import { MessageTransport } from '@/common/messaging/transport';

export class CorePostOffice extends PostOffice {
  constructor(transport: MessageTransport) {
    super(transport);
  }
}

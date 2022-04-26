import { BazaarWebhookType } from './BazaarWebhookType';

export interface BazarrWebhookEvent {
  version: string;
  title: string;
  message: string;
  attachments: any[];
  type: BazaarWebhookType;
}


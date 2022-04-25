export interface BazarrEvent {
  version: string;
  title: string;
  message: string;
  attachments: any[];
  type: Type;
}

export enum Type {
  Info = 'info',
}

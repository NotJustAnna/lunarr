import { Message, Reply } from './index';

export class InitFlatAssocMessage extends Message {
  discordUserId!: string;

  constructor(discordUserId?: string) {
    super();
    if (discordUserId) {
      this.discordUserId = discordUserId;
    }
  }
}

export class InitFlatAssocReply extends Reply {
  link!: string;

  constructor(props?: Omit<InitFlatAssocReply, 'id'>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
  }
}

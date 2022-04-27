import { v4 } from 'uuid';

export abstract class Message {
  id!: string;

  constructor() {
    this.id = v4();
  }
}

export class EmptyMessage extends Message {
}

export abstract class Reply extends Message {
  replyTo!: string;
}

export class EmptyReply extends Reply {
  constructor(replyTo?: string) {
    super();
    if (replyTo) {
      this.replyTo = replyTo;
    }
  }
}

export class ErrorMessage extends Message {
  error!: any;

  constructor(error?: any) {
    super();
    if (error) {
      this.error = error;
    }
  }
}

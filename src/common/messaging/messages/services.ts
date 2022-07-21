import { Message, Reply } from './index';
import { ServiceStart } from '../../init/ServiceStart';

export class StartServiceMessage extends Message {
  services!: ServiceStart[];

  constructor(services?: ServiceStart[]) {
    super();
    if (services) {
      this.services = services;
    }
  }
}

export class StopServiceMessage extends Message {
  services!: string[];

  constructor(services?: string[]) {
    super();
    if (services) {
      this.services = services;
    }
  }
}

export class ServiceStartedMessage extends Message {
  serviceName!: string;

  constructor(props?: Omit<ServiceStartedMessage, 'id'>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
  }
}

export class ServiceStoppedMessage extends Message {
  serviceName!: string;
  exitCode!: number;

  constructor(props?: Omit<ServiceStoppedMessage, 'id'>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
  }
}

export class ListServicesReply extends Reply {
  services!: string[];

  constructor(props?: Omit<ListServicesReply, 'id'>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
  }
}

export class WhoAmIReply extends Reply {
  serviceName!: string;

  constructor(props?: Omit<WhoAmIReply, 'id'>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
  }
}

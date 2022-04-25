import { parentPort } from 'worker_threads';
import { createLogger } from '../logger';

export type MessageSender = (message: [dest: string, data: any]) => void;

export interface Subsystem {
  onMessage(data: any): void | Promise<void>;
}

export function start(SubsystemImpl: abstract new (sender: MessageSender) => Subsystem) {
  const port = parentPort;
  if (!port) {
    throw Error('This code is meant to run on a worker thread!');
  }

  createLogger(SubsystemImpl.name).info(`Starting ${SubsystemImpl.name}...`);
  const subsystem: Subsystem = new (SubsystemImpl as any)(port.postMessage.bind(port));
  port.on('message', subsystem.onMessage.bind(subsystem));
}

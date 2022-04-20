import { parentPort, MessagePort } from 'worker_threads';

export function workerPort(): MessagePort {
  const port = parentPort;

  if (!port) {
    throw Error("This code is meant to run on a worker thread!");
  }

  return port;
}

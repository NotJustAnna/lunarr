import { Logger } from './Logger';
import * as process from 'process';
import { AdvancedLogger } from './AdvancedLogger';
import { SimpleLogger } from './SimpleLogger';

export function createLogger(name: string): Logger {
  if (process.env.ADVANCED_LOGGER) {
    return new AdvancedLogger(name);
  }
  return new SimpleLogger(name);
}

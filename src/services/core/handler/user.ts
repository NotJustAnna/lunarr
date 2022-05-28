import { createLogger } from '../../../utils/logger';
import { DataSource } from 'typeorm';
import { NanoflakeLocalGenerator } from 'nanoflakes';
import * as process from 'process';

export class UserHandler {
  private static readonly logger = createLogger('UserHandler');

  private inMemoryFlatAssocs: Record<string, string> = {};

  constructor(private readonly database: DataSource, private readonly nanoflakes: NanoflakeLocalGenerator) {
  }

  public initFlatAssoc(discordUserId: string): string {
    let flat = this.nanoflakes.next().value.toString(36);
    this.inMemoryFlatAssocs[flat] = discordUserId;
    setTimeout(() => delete this.inMemoryFlatAssocs[flat], 900000); // delete in 15 minutes
    return `${process.env.PUBLIC_URL}/associate?flat=${flat}`;
  }
}

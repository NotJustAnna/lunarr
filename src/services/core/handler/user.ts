import { createLogger } from '../../../utils/logger';
import { NanoflakeLocalGenerator } from 'nanoflakes';
import * as process from 'process';
import { PrismaClient } from '../../../generated/prisma-client';
import { CorePostOffice } from '../postOffice';
import { InitFlatAssocMessage, InitFlatAssocReply } from '../../../messaging/messages/flatAssoc';
import { ErrorReply } from '../../../messaging/messages';
import { Result } from '../../../messaging/packet/types';

export class UserHandler {
  private static readonly logger = createLogger('UserHandler');

  private inMemoryFlatAssocs: Record<string, string> = {};

  constructor(
    private readonly client: PrismaClient,
    private readonly postOffice: CorePostOffice,
    private readonly nanoflakes: NanoflakeLocalGenerator
  ) {
    this.postOffice.ofType(InitFlatAssocMessage, (from, { id, discordUserId }) => {
      try {
        const link = this.initFlatAssoc(discordUserId);
        this.postOffice.send(from, new InitFlatAssocReply({ replyTo: id, link }));
      } catch (error) {
        UserHandler.logger.error('Error while initializing FLAT-based association flow', { error });
        this.postOffice.send(from, new ErrorReply({ replyTo: id, error }));
      }
      return Result.Continue;
    });
  }

  public initFlatAssoc(discordUserId: string): string {
    let flat = this.nanoflakes.next().value.toString(36);
    this.inMemoryFlatAssocs[flat] = discordUserId;
    setTimeout(() => delete this.inMemoryFlatAssocs[flat], 900000); // delete in 15 minutes
    return `${process.env.PUBLIC_URL}/associate?flat=${flat}`;
  }
}

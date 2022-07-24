import { Service } from 'typedi';
import process from 'process';
import { NanoflakeLocalGenerator } from 'nanoflakes';

@Service()
export class AuthService {
  private inMemoryFlatAssocs: Record<string, string> = {};

  constructor(private nanoflakes: NanoflakeLocalGenerator) {}

  public initFlatAssocFlow(discordUserId: string) {
    let flat = this.nanoflakes.next().value.toString(36);
    this.inMemoryFlatAssocs[flat] = discordUserId;
    setTimeout(() => delete this.inMemoryFlatAssocs[flat], 900000); // delete in 15 minutes
    return `${process.env.PUBLIC_URL}/associate?flat=${flat}`;
  }
}

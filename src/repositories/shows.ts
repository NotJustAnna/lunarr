import { createLogger } from '@/app/logger';
import { Prisma, PrismaClient, Show } from '@prisma/client';
import { Service } from 'typedi';
import { ChangeSetService } from '@/services/events/changeSet';
import ShowWhereInput = Prisma.ShowWhereInput;

@Service()
export class ShowsRepository {
  private static readonly logger = createLogger('ShowsRepository');

  constructor(
    private readonly client: PrismaClient,
    private readonly events: ChangeSetService,
  ) {
  }

  private static fromChanges(changes: Partial<Show>): ShowWhereInput {
    const finders: ShowWhereInput[] = [];
    if (changes.jellyfinId) {
      finders.push({ jellyfinId: changes.jellyfinId });
    }
    if (changes.sonarrId) {
      finders.push({ sonarrId: changes.sonarrId });
    }
    if (changes.ombiRequestId) {
      finders.push({ ombiRequestId: changes.ombiRequestId });
    }
    if (changes.tvdbId) {
      finders.push({ tvdbId: changes.tvdbId });
    }
    if (changes.tvRageId) {
      finders.push({ tvRageId: changes.tvRageId });
    }
    if (changes.tvMazeId) {
      finders.push({ tvMazeId: changes.tvMazeId });
    }
    return { OR: finders };
  }

  async all() {
    return this.client.show.findMany();
  }

  async sync(changes: Partial<Show>) {
    const show = await this.findUniqueOrMerge(ShowsRepository.fromChanges(changes));
    if (show) {
      const updatedShow = await this.client.show.update({ data: changes, where: { id: show.id } });
      await this.events.fromShowChanges(show, changes);
      return updatedShow;
    } else {
      const newShow = await this.client.show.create({ data: changes });
      await this.events.fromNewShow(newShow);
      return newShow;
    }
  }

  private async findUniqueOrMerge(where: ShowWhereInput) {
    const shows = await this.client.show.findMany({ where, orderBy: { createdAt: 'asc' } });
    if (shows.length === 0) {
      return null;
    }
    if (shows.length === 1) {
        return shows[0];
    }
    // NOTE: Might be worth debugging why shows got duplicated.
    const data = shows.reduce((show, duplicate) => {
      show.title = duplicate.title || show.title;
      show.jellyfinId = duplicate.jellyfinId || show.jellyfinId;
      show.sonarrId = duplicate.sonarrId || show.sonarrId;
      show.ombiRequestId = duplicate.ombiRequestId || show.ombiRequestId;
      show.tvdbId = duplicate.tvdbId || show.tvdbId;
      show.tvRageId = duplicate.tvRageId || show.tvRageId;
      show.tvMazeId = duplicate.tvMazeId || show.tvMazeId;
      show.jellyfinState = duplicate.jellyfinState || show.jellyfinState;
      show.sonarrState = duplicate.sonarrState || show.sonarrState;
      return show;
    });
    await this.client.$transaction([
      this.client.show.update({ data, where: { id: shows[0].id } }),
      this.client.show.deleteMany({ where: { id: { not: shows[0].id, in: shows.map(m => m.id) } } }),
    ]);
    return data;
  }

  async foreignUntrack<Key extends keyof Show, State extends keyof Show>(
    foreignKey: Key, allowedKeys: ShowWhereInput[Key][],
    stateKey: State, allowedState: ShowWhereInput[State],
  ) {
    const shows = await this.client.show.findMany({
      where: {
        [foreignKey]: { not: null, notIn: allowedKeys },
        [stateKey]: { not: allowedState },
      },
    });

    if (shows.length > 0) {
      await this.client.show.updateMany({
        data: { [foreignKey]: null, [stateKey]: allowedState },
        where: { id: { in: shows.map(s => s.id) } },
      });
      await Promise.all(
        shows.map(
          s => this.events.fromShowChanges(s, { [foreignKey]: null, [stateKey]: allowedState }),
        ),
      );
    }
  }
}

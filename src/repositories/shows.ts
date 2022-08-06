import { createLogger } from '@/app/logger';
import { Prisma, PrismaClient, Show } from '@prisma/client';
import { Service } from 'typedi';
import { ChangeSetService } from '@/services/events/changeSet';
import { ShowSeasonsRepository } from '@/repositories/showSeasons';
import { performance } from 'perf_hooks';
import ShowWhereInput = Prisma.ShowWhereInput;

@Service()
export class ShowsRepository {
  private static readonly logger = createLogger('ShowsRepository');

  constructor(
    private readonly client: PrismaClient,
    private readonly events: ChangeSetService,
    private readonly seasons: ShowSeasonsRepository,
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
    return this.client.$transaction(async (client) => {
      const shows = await client.show.findMany({
        where: ShowsRepository.fromChanges(changes),
        orderBy: { createdAt: 'asc' },
      });
      if (shows.length === 0) {
        const newShow = await client.show.create({ data: changes });
        this.events.fromNewShow(newShow);
        return newShow;
      } else if (shows.length === 1) {
        const updatedShow = await client.show.update({ data: changes, where: { id: shows[0].id } });
        this.events.fromShowChanges(shows[0], changes);
        return updatedShow;
      } else {
        ShowsRepository.logger.debug('Found multiple shows matching a single sync(), merging...');
        const start = performance.now();
        // NOTE: Might be worth debugging why shows got duplicated.
        const merged = shows.reduce((show, duplicate) => {
          show.sonarrTitle = duplicate.sonarrTitle || show.sonarrTitle;
          show.jellyfinTitle = duplicate.jellyfinTitle || show.jellyfinTitle;
          show.ombiRequestTitle = duplicate.ombiRequestTitle || show.ombiRequestTitle;
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
        const { id, ...mergedChanges } = merged;
        const mergedShows = shows.slice(1).map(m => m.id);
        await this.seasons.internal_showMerging(client, id, mergedShows);
        await client.show.deleteMany({ where: { id: { in: mergedShows } } });
        const updatedShow = await client.show.update({ data: { ...mergedChanges, ...changes }, where: { id } });
        this.events.fromShowChanges(merged, changes);
        ShowsRepository.logger.debug(`Merged ${shows.length} shows in ${performance.now() - start}ms`);
        return updatedShow;
      }
    }, { maxWait: 5000 });
  }

  async foreignUntrack<Key extends keyof Show, State extends keyof Show>(
    foreignKey: Key, allowedKeys: ShowWhereInput[Key][],
    stateKey: State, allowedState: ShowWhereInput[State],
  ) {
    await this.client.$transaction<void>(async (client) => {
      const shows = await client.show.findMany({
        where: {
          [foreignKey]: { not: null, notIn: allowedKeys },
          [stateKey]: { not: allowedState },
        },
      });

      if (shows.length > 0) {
        await client.show.updateMany({
          data: { [foreignKey]: null, [stateKey]: allowedState },
          where: { id: { in: shows.map(s => s.id) } },
        });
        for (const s of shows) {
          this.events.fromShowChanges(s, { [foreignKey]: null, [stateKey]: allowedState });
        }
      }
    }, { maxWait: 5000 });
  }

  async deleteUntracked() {
    return this.client.show.deleteMany({
      where: {
        sonarrState: null,
        jellyfinState: null,
      },
    });
  }

  async getById(id: string) {
    return this.client.show.findUnique({ where: { id } });
  }
}

import { Show } from '../data/show';
import { v4 } from 'uuid';

export class ShowRepository {
  private all: Set<Show> = new Set();

  // lookups
  private byId: Record<string, Show> = {};
  private byJellyfinId: Record<string, Show> = {};
  private bySonarrId: Record<string, Show> = {};
  private byOmbiRequestId: Record<string, Show> = {};
  private byTvdbId: Record<string, Show> = {};
  private byTvMazeId: Record<string, Show> = {};
  private byTvRageId: Record<string, Show> = {};

  getById(id: string): Show | null {
    const show = this.byId[id];
    return show ? { ...show } : null;
  }

  getByJellyfinId(id: string): Show | null {
    const show = this.byJellyfinId[id];
    return show ? { ...show } : null;
  }

  getBySonarrId(id: string): Show | null {
    const show = this.bySonarrId[id];
    return show ? { ...show } : null;
  }

  getByOmbiRequestId(id: string): Show | null {
    const show = this.byOmbiRequestId[id];
    return show ? { ...show } : null;
  }

  getByTvdbId(id: string): Show | null {
    const show = this.byTvdbId[id];
    return show ? { ...show } : null;
  }

  getByTvMazeId(id: string): Show | null {
    const show = this.byTvMazeId[id];
    return show ? { ...show } : null;
  }

  getByTvRageId(id: string): Show | null {
    const show = this.byTvRageId[id];
    return show ? { ...show } : null;
  }

  findOne(func: (show: Show) => boolean): Show | null {
    const show = [...this.all].find(func);
    return show ? { ...show } : null;
  }

  findAll(func: (show: Show) => boolean): Show[] {
    return [...this.all].filter(func);
  }

  removeById(id: string): void {
    const show = this.byId[id];
    if (show) {
      this.all.delete(show);
      delete this.byId[id];
      if (show.jellyfinId) {
        delete this.byJellyfinId[show.jellyfinId];
      }
      if (show.sonarrId) {
        delete this.bySonarrId[show.sonarrId];
      }
      if (show.ombiRequestId) {
        delete this.byOmbiRequestId[show.ombiRequestId];
      }
      if (show.tvdbId) {
        delete this.byTvdbId[show.tvdbId];
      }
      if (show.tvMazeId) {
        delete this.byTvMazeId[show.tvMazeId];
      }
      if (show.tvRageId) {
        delete this.byTvRageId[show.tvRageId];
      }
    }
  }

  // Implementation note:
  // This function uses Object.assign() instead of deep-assigning the object.
  save(obj: Show) {
    const show = { ...obj };

    if (show.jellyfinId) {
      const lookup = this.byJellyfinId[show.jellyfinId];
      if (lookup && lookup.id !== show.id) {
        throw new Error(`Show ${show.id} with jellyfin id ${show.jellyfinId} tried to override existing show ${lookup.id} with same jellyfin id`);
      }
    }
    if (show.sonarrId) {
      const lookup = this.bySonarrId[show.sonarrId];
      if (lookup && lookup.id !== show.id) {
        throw new Error(`Show ${show.id} with sonarr id ${show.sonarrId} tried to override existing show ${lookup.id} with same sonarr id`);
      }
    }
    if (show.ombiRequestId) {
      const lookup = this.byOmbiRequestId[show.ombiRequestId];
      if (lookup && lookup.id !== show.id) {
        throw new Error(`Show ${show.id} with ombi request id ${show.ombiRequestId} tried to override existing show ${lookup.id} with same ombi request id`);
      }
    }
    if (show.tvdbId) {
      const lookup = this.byTvdbId[show.tvdbId];
      if (lookup && lookup.id !== show.id) {
        throw new Error(`Show ${show.id} with tvdb id ${show.tvdbId} tried to override existing show ${lookup.id} with same tvdb id`);
      }
    }
    if (show.tvMazeId) {
      const lookup = this.byTvMazeId[show.tvMazeId];
      if (lookup && lookup.id !== show.id) {
        throw new Error(`Show ${show.id} with tvMaze id ${show.tvMazeId} tried to override existing show ${lookup.id} with same tvMaze id`);
      }
    }
    if (show.tvRageId && show.tvRageId !== '0') {
      const lookup = this.byTvRageId[show.tvRageId];
      if (lookup && lookup.id !== show.id) {
        throw new Error(`Show ${show.id} with tvRage id ${show.tvRageId} tried to override existing show ${lookup.id} with same tvRage id`);
      }
    }

    const existing = this.byId[show.id];
    if (existing) {
      if (existing.jellyfinId && existing.jellyfinId !== show.jellyfinId) {
        delete this.byJellyfinId[existing.jellyfinId];
      }
      if (existing.sonarrId && existing.sonarrId !== show.sonarrId) {
        delete this.bySonarrId[existing.sonarrId];
      }
      if (existing.ombiRequestId && existing.ombiRequestId !== show.ombiRequestId) {
        delete this.byOmbiRequestId[existing.ombiRequestId];
      }
      if (existing.tvdbId && existing.tvdbId !== show.tvdbId) {
        delete this.byTvdbId[existing.tvdbId];
      }
      if (existing.tvMazeId && existing.tvMazeId !== show.tvMazeId) {
        delete this.byTvMazeId[existing.tvMazeId];
      }
      if (existing.tvRageId && existing.tvRageId !== '0' && existing.tvRageId !== show.tvRageId) {
        delete this.byTvRageId[existing.tvRageId];
      }

      Object.assign(existing, show);
    } else {
      this.all.add(show);
      this.byId[show.id] = show;
    }

    if (show.jellyfinId) {
      this.byJellyfinId[show.jellyfinId] = show;
    }
    if (show.sonarrId) {
      this.bySonarrId[show.sonarrId] = show;
    }
    if (show.ombiRequestId) {
      this.byOmbiRequestId[show.ombiRequestId] = show;
    }
    if (show.tvdbId) {
      this.byTvdbId[show.tvdbId] = show;
    }
    if (show.tvMazeId) {
      this.byTvMazeId[show.tvMazeId] = show;
    }
    if (show.tvRageId && show.tvRageId !== '0') {
      this.byTvRageId[show.tvRageId] = show;
    }
  }

  clear() {
    this.all.clear();
    this.byId = {};
    this.byJellyfinId = {};
    this.bySonarrId = {};
    this.byOmbiRequestId = {};
    this.byTvdbId = {};
    this.byTvMazeId = {};
    this.byTvRageId = {};
  }

  newId() {
    let attempts = 25;
    while (attempts--) {
      const uuid = v4();
      if (uuid in this.byId) {
        continue;
      }
      return uuid;
    }
    throw new Error('Could not find a unique id');
  }

  getAll() {
    return [...this.all].map(serieis => ({ ...serieis }));
  }
}

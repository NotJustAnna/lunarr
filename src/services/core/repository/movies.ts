import { Movie } from '../data/movie';

export class MovieRepository {
  private all: Set<Movie> = new Set<Movie>();

  // lookups
  private byId: Record<string, Movie> = {};
  private byJellyfinId: Record<string, Movie> = {};
  private byRadarrId: Record<string, Movie> = {};
  private byOmbiRequestId: Record<string, Movie> = {};
  private byTmdbId: Record<string, Movie> = {};
  private byImdbId: Record<string, Movie> = {};

  getById(id: string): Movie | null {
    const movie = this.byId[id];
    return !movie ? null : { ...movie };
  }

  getByJellyfinId(id: string): Movie | null {
    const movie = this.byJellyfinId[id];
    return !movie ? null : { ...movie };
  }

  getByRadarrId(id: string): Movie | null {
    const movie = this.byRadarrId[id];
    return !movie ? null : { ...movie };
  }

  getByOmbiRequestId(id: string): Movie | null {
    const movie = this.byOmbiRequestId[id];
    return !movie ? null : { ...movie };
  }

  getByTmdbId(id: string): Movie | null {
    const movie = this.byTmdbId[id];
    return !movie ? null : { ...movie };
  }

  getByImdbId(id: string): Movie | null {
    const movie = this.byImdbId[id];
    return !movie ? null : { ...movie };
  }

  findOne(func: (movie: Movie) => boolean): Movie | null {
    let movie = [...this.all].find(func);
    return !movie ? null : { ...movie };
  }

  findAll(func: (movie: Movie) => boolean): Movie[] {
    return [...this.all].filter(func).map((movie) => ({ ...movie }));
  }

  removeById(id: string): void {
    const movie = this.byId[id];
    if (movie) {
      this.all.delete(movie);
      delete this.byId[id];
      if (movie.jellyfinId) {
        delete this.byJellyfinId[movie.jellyfinId];
      }
      if (movie.radarrId) {
        delete this.byRadarrId[movie.radarrId];
      }
      if (movie.ombiRequestId) {
        delete this.byOmbiRequestId[movie.ombiRequestId];
      }
      if (movie.tmdbId) {
        delete this.byTmdbId[movie.tmdbId];
      }
      if (movie.imdbId) {
        delete this.byImdbId[movie.imdbId];
      }
    }
  }

  // Implementation note:
  // This function uses Object.assign() instead of deep-assigning the object.
  save(obj: Movie) {
    const movie = { ...obj };

    if (movie.jellyfinId) {
      const lookup = this.byJellyfinId[movie.jellyfinId];
      if (lookup && lookup.id !== movie.id) {
        throw new Error(`Movie ${movie.id} with jellyfin id ${movie.jellyfinId} tried to override existing movie ${lookup.id} with same jellyfin id`);
      }
    }
    if (movie.radarrId) {
      const lookup = this.byRadarrId[movie.radarrId];
      if (lookup && lookup.id !== movie.id) {
        throw new Error(`Movie ${movie.id} with radarr id ${movie.radarrId} tried to override existing movie ${lookup.id} with same radarr id`);
      }
    }
    if (movie.ombiRequestId) {
      const lookup = this.byOmbiRequestId[movie.ombiRequestId];
      if (lookup && lookup.id !== movie.id) {
        throw new Error(`Movie ${movie.id} with ombi request id ${movie.ombiRequestId} tried to override existing movie ${lookup.id} with same ombi request id`);
      }
    }
    if (movie.tmdbId) {
      const lookup = this.byTmdbId[movie.tmdbId];
      if (lookup && lookup.id !== movie.id) {
        throw new Error(`Movie ${movie.id} with tmdb id ${movie.tmdbId} tried to override existing movie ${lookup.id} with same tmdb id`);
      }
    }
    if (movie.imdbId) {
      const lookup = this.byImdbId[movie.imdbId];
      if (lookup && lookup.id !== movie.id) {
        throw new Error(`Movie ${movie.id} with imdb id ${movie.imdbId} tried to override existing movie ${lookup.id} with same imdb id`);
      }
    }

    const existing = this.byId[movie.id];
    if (existing) {
      if (existing.jellyfinId && existing.jellyfinId !== movie.jellyfinId) {
        delete this.byJellyfinId[existing.jellyfinId];
      }
      if (existing.radarrId && existing.radarrId !== movie.radarrId) {
        delete this.byRadarrId[existing.radarrId];
      }
      if (existing.ombiRequestId && existing.ombiRequestId !== movie.ombiRequestId) {
        delete this.byOmbiRequestId[existing.ombiRequestId];
      }
      if (existing.tmdbId && existing.tmdbId !== movie.tmdbId) {
        delete this.byTmdbId[existing.tmdbId];
      }
      if (existing.imdbId && existing.imdbId !== movie.imdbId) {
        delete this.byImdbId[existing.imdbId];
      }

      Object.assign(existing, movie);
    } else {
      this.all.add(movie);
      this.byId[movie.id] = movie;

    }

    if (movie.jellyfinId) {
      this.byJellyfinId[movie.jellyfinId] = movie;
    }
    if (movie.radarrId) {
      this.byRadarrId[movie.radarrId] = movie;
    }
    if (movie.ombiRequestId) {
      this.byOmbiRequestId[movie.ombiRequestId] = movie;
    }
    if (movie.tmdbId) {
      this.byTmdbId[movie.tmdbId] = movie;
    }
    if (movie.imdbId) {
      this.byImdbId[movie.imdbId] = movie;
    }
  }

  clear() {
    this.all.clear();
    this.byId = {};
    this.byJellyfinId = {};
    this.byRadarrId = {};
    this.byOmbiRequestId = {};
    this.byTmdbId = {};
    this.byImdbId = {};
  }

  getAll() {
    return [...this.all].map(movie => ({ ...movie }));
  }
}

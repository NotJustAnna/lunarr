import fs from 'fs-extra';
import { Movie } from './data/movie';
import { Show } from './data/show';
import { MovieRepository } from './repository/movies';
import { ShowRepository } from './repository/shows';

export class FlixDatabase {
  public readonly movies = new MovieRepository();
  public readonly shows = new ShowRepository();

  constructor(private readonly dir: string) {}

  async load() {
    await fs.ensureDir(this.dir);

    const [movies, shows] = await Promise.all([
      readJsonOrNull<Movie[]>(`${this.dir}/movies.json`),
      readJsonOrNull<Show[]>(`${this.dir}/shows.json`),
      // readJsonOrNull(`${this.dir}/users.json`),
    ])

    if (movies) {
      this.movies.clear();
      for (const movie of movies) {
        this.movies.save(movie);
      }
    }

    if (shows) {
      this.shows.clear();
      for (const show of shows) {
        this.shows.save(show);
      }
    }
  }

  async save() {
    const moviesArr = this.movies.getAll();
    const showsArr = this.shows.getAll();

    const now = new Date().toJSON().slice(0, -1).replaceAll(/[-:.]/g, '_').replace('T', '-');
    await fs.ensureDir(`${this.dir}/backup`);
    await Promise.all([
      fs.writeJson(`${this.dir}/movies.json`, moviesArr),
      fs.writeJson(`${this.dir}/shows.json`, showsArr),
      // fs.writeJson(`${this.dir}/users.json`, Object.values(this.users)),
      fs.writeJson(`${this.dir}/backup/movies-${now}.json`, moviesArr),
      fs.writeJson(`${this.dir}/backup/shows-${now}.json`, showsArr),
      // fs.writeJson(`${this.dir}/backup/users-${now}.json`, Object.values(this.users)),
    ]);
  }
}

async function readJsonOrNull<T = any>(file: string): Promise<T | null> {
  try {
    return await fs.readJson(file, { throws: false });
  } catch (err) {
    if (typeof err === 'object' && (err as any)['code'] === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

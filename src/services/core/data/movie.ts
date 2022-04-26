import { JellyfinState, OmbiRequestState, RadarrState } from './enums';

export interface Movie {
  /**
   * Internal identifier for a given object.
   * Should be a UUID.
   */
  id: string;

  /**
   * Title of the movie.
   */
  title: string;

  /**
   * Identifies this movie on the connected Jellyfin server.
   */
  jellyfinId?: string;

  /**
   * The last known state of the movie on the connected Jellyfin server.
   */
  jellyfinState: JellyfinState;

  /**
   * Identifies this movie on the connected Radarr server.
   */
  radarrId?: string;

  /**
   * The last known state of the movie on the connected Radarr server.
   */
  radarrState: RadarrState;

  /**
   * Identifies this movie as a request on the connected Ombi server.
   */
  ombiRequestId?: string;

  /**
   * The last known state of this movie on the connected Ombi server.
   */
  ombiRequestState: OmbiRequestState;

  /**
   * Identifies this movie on TMDB.
   */
  tmdbId?: string;

  /**
   * Identifies this movie on IMDB.
   */
  imdbId?: string;

  /**
   * Holds the data given by Jellyfin about the movie's file.
   */
  jellyfinData?: JellyfinData;
}

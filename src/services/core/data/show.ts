import { JellyfinState, OmbiRequestState, SonarrState } from './enums';

export interface Show {
  /**
   * Internal identifier for a given object.
   * Should be a UUID.
   */
  id: string;

  // TODO does Jellyfin have this?
  /**
   * Identifies this show on the connected Jellyfin server.
   */
  jellyfinId?: string;

  /**
   * Identifies this show on the connected Sonarr server.
   */
  sonarrId?: string;

  /**
   * Identifies this show as a request on the connected Ombi server.
   */
  ombiRequestId?: string;

  /**
   * Identifies this movie on TVDB.
   */
  tvdbId?: string;

  /**
   * Identifies this movie on TvRage.
   */
  tvRageId?: string;

  /**
   * Identifies this movie on TvMaze.
   */
  tvMazeId?: string;

  /**
   * The title of the show.
   */
  title: string;

  /**
   * This show's seasons.
   */
  seasons: Season[];
}

export interface Season {
  /**
   * Number of the season.
   */
  number: number;

  // TODO does Jellyfin have this?

  /**
   * This season's episodes.
   */
  episodes: Episode[];
}

export interface Episode {
  /**
   * Number of the episode.
   */
  number: number;

  /**
   * Title of the episode.
   */
  title: string;

  /**
   * Identifies this episode on the connected Jellyfin server.
   */
  jellyfinId?: string;

  /**
   * The last known state of the episode on the connected Jellyfin server.
   */
  jellyfinState: JellyfinState;

  /**
   * Identifies this episode on the connected Sonarr server.
   */
  sonarrId?: string;

  /**
   * The last known state of the episode on the connected Sonarr server.
   */
  sonarrState: SonarrState;

  /**
   * The last known state of this movie on the connected Ombi server.
   * (Ombi doesn't have an ID for episodes, so we have to use the show ID with the season and episode number.)
   */
  ombiRequestState: OmbiRequestState;

  /**
   * Holds the data given by Jellyfin about the episode's file.
   */
  jellyfinData?: JellyfinData;
}

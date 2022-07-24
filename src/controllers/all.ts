/*
 * This file exports all the controllers.
 * It is used to startup the app.
 *
 * Export only concrete classes.
 * Abstract classes should not be exported and will break initialization if added.
 */
export { DatabaseController } from './database';
export { HttpController } from './http';

export { BazarrIntegration } from './integrations/bazarr';
export { DiscordIntegration } from './integrations/discord';
export { JellyfinIntegration } from './integrations/jellyfin';
export { LidarrIntegration } from './integrations/lidarr';
export { OmbiIntegration } from './integrations/ombi';
export { OverseerrIntegration } from './integrations/overseerr';
export { PlexIntegration } from './integrations/plex';
export { RadarrIntegration } from './integrations/radarr';
export { SonarrIntegration } from './integrations/sonarr';

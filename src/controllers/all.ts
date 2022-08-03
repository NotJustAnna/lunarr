/*
 * This file exports all the controllers.
 * It is used to start up the http service.
 *
 * Export only concrete classes.
 * Abstract classes should not be exported and will break initialization if added.
 */
export { ShowsController } from './shows.controller';
export { JobsController } from './jobs.controller';
export { WebhooksController } from './webhooks.controller';
export { FlatAssocController } from './flatAssoc.controller';

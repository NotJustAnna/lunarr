/*
 * This file exports all the setup services.
 * It is used to startup the app.
 *
 * Export only concrete classes.
 * Classes exported here are meant to properly setup TypeDI.
 * Abstract classes should not be exported and will break initialization if added.
 */
export * from './dependencies';

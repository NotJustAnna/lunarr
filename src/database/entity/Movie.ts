import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RadarrState } from '../enums/radarrState';
import { JellyfinState } from '../enums/jellyfinState';
import { MovieAudioTrack } from './jellyfin/MovieAudioTrack';
import { MovieVideoTrack } from './jellyfin/MovieVideoTrack';
import { MovieSubtitleTrack } from './jellyfin/MovieSubtitleTrack';

@Entity('movie')
export class Movie {
  @PrimaryGeneratedColumn('uuid', { name: 'movi_id' })
  @Index({ unique: true })
  id!: string;

  @CreateDateColumn({ name: 'movi_created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'movi_updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'movi_deleted_at' })
  deletedAt!: Date;

  @Column({ name: 'movi_jellyfin_state', type: 'enum', enum: JellyfinState, default: JellyfinState.NONE })
  jellyfinState!: JellyfinState;

  @OneToMany(() => MovieVideoTrack, track => track.movie)
  jellyfinVideoTracks!: MovieVideoTrack[];

  @OneToMany(() => MovieAudioTrack, track => track.movie)
  jellyfinAudioTracks!: MovieAudioTrack[];

  @OneToMany(() => MovieSubtitleTrack, track => track.movie)
  jellyfinSubtitleTracks!: MovieSubtitleTrack[];

  @Column('text', { name: 'movi_jellyfin_id', unique: true, nullable: true })
  @Index({ unique: true })
  jellyfinId?: string;

  @Column('text', { name: 'movi_radarr_id', unique: true, nullable: true })
  @Index({ unique: true })
  radarrId?: string;

  @Column({ name: 'movi_radarr_state', type: 'enum', enum: RadarrState, default: RadarrState.NONE })
  radarrState!: RadarrState;

  @Column('text', { name: 'movi_ombi_request_id', unique: true, nullable: true })
  @Index({ unique: true })
  ombiRequestId?: string;

  @Column('text', { name: 'movi_tmdb_id', unique: true, nullable: true })
  @Index({ unique: true })
  tmdbId?: string;

  @Column('text', { name: 'movi_imdb_id', unique: true, nullable: true })
  @Index({ unique: true })
  imdbId?: string;

  @Column('text', { name: 'movi_title', nullable: true })
  title?: string;
}

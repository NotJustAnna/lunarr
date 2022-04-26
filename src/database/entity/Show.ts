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
import { ShowSeason } from './ShowSeason';
import { SonarrState } from '../enums/sonarrState';

@Entity('show')
export class Show {
  @PrimaryGeneratedColumn('uuid', { name: 'show_id' })
  @Index({ unique: true })
  id!: string;

  @CreateDateColumn({ name: 'show_created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'show_updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'show_deleted_at' })
  deletedAt!: Date;

  @Column('text', { name: 'show_jellyfin_id', unique: true, nullable: true })
  @Index({ unique: true })
  jellyfinId?: string;

  @Column('text', { name: 'show_sonarr_id', unique: true, nullable: true })
  @Index({ unique: true })
  sonarrId?: string;

  @Column({ name: 'show_sonarr_state', type: 'enum', enum: SonarrState, default: SonarrState.NONE })
  sonarrState!: SonarrState;

  @Column('text', { name: 'show_ombi_request_id', unique: true, nullable: true })
  @Index({ unique: true })
  ombiRequestId?: string;

  @Column('text', { name: 'show_tvdb_id', unique: true, nullable: true })
  @Index({ unique: true })
  tvdbId?: string;

  @Column('text', { name: 'show_tvrage_id', unique: true, nullable: true })
  @Index({ unique: true })
  tvRageId?: string;

  @Column('text', { name: 'show_tvmaze_id', unique: true, nullable: true })
  @Index({ unique: true })
  tvMazeId?: string;

  @Column('text', { name: 'show_title', nullable: true })
  title?: string;

  @OneToMany(() => ShowSeason, season => season.show)
  seasons!: ShowSeason[];
}

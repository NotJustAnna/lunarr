import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShowSeason } from './ShowSeason';
import { JellyfinState } from '../enums/jellyfinState';
import { SonarrEpisodeState } from '../enums/sonarrEpisodeState';
import { OmbiRequestState } from '../enums/ombiRequestState';
import { EpisodeVideoTrack } from './jellyfin/EpisodeVideoTrack';
import { EpisodeSubtitleTrack } from './jellyfin/EpisodeSubtitleTrack';
import { EpisodeAudioTrack } from './jellyfin/EpisodeAudioTrack';

@Entity('show_episode')
@Index(['seasonId', 'episodeNumber'], { unique: true })
export class ShowEpisode {
  @PrimaryGeneratedColumn('uuid', { name: 'shep_id' })
  @Index({ unique: true })
  id!: string;

  @Column('integer', { name: 'shep_number' })
  episodeNumber!: number;

  @Column('uuid', { name: 'shse_id' })
  seasonId!: string;

  @ManyToOne(() => ShowSeason, season => season.episodes)
  @JoinColumn({ name: 'shse_id' })
  season!: ShowSeason;

  @CreateDateColumn({ name: 'shep_created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'shep_updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'shep_deleted_at' })
  deletedAt!: Date;

  @Column('text', { name: 'shep_title', nullable: true })
  title?: string;

  @Column('text', { name: 'shep_jellyfin_id', unique: true, nullable: true })
  @Index({ unique: true })
  jellyfinId?: string;

  @Column({ name: 'shep_jellyfin_state', type: 'enum', enum: JellyfinState, default: JellyfinState.NONE })
  jellyfinState!: JellyfinState;

  @OneToMany(() => EpisodeVideoTrack, track => track.episode)
  jellyfinVideoTracks!: EpisodeVideoTrack[];

  @OneToMany(() => EpisodeAudioTrack, track => track.episode)
  jellyfinAudioTracks!: EpisodeAudioTrack[];

  @OneToMany(() => EpisodeSubtitleTrack, track => track.episode)
  jellyfinSubtitleTracks!: EpisodeSubtitleTrack[];

  @Column('text', { name: 'shep_sonarr_id', unique: true, nullable: true })
  @Index({ unique: true })
  sonarrId?: string;

  @Column({ name: 'shep_sonarr_state', type: 'enum', enum: SonarrEpisodeState, default: SonarrEpisodeState.NONE })
  sonarrState!: SonarrEpisodeState;

  @Column({ name: 'shep_ombi_request_state', type: 'enum', enum: OmbiRequestState, default: OmbiRequestState.NONE })
  ombiRequestState!: OmbiRequestState;
}

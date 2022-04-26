import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShowEpisode } from '../ShowEpisode';
import { JellyfinSubtitleTrack } from '../../interface/JellyfinSubtitleTrack';

@Entity('episode_subtitle_track')
export class EpisodeSubtitleTrack implements JellyfinSubtitleTrack {
  @PrimaryGeneratedColumn('uuid', { name: 'epst_id' })
  @Index({ unique: true })
  id!: string;

  @Column('uuid', { name: 'shep_id' })
  episodeId!: string;

  @ManyToOne(() => ShowEpisode, episode => episode.jellyfinSubtitleTracks)
  @JoinColumn({ name: 'shep_id' })
  episode!: ShowEpisode;

  @CreateDateColumn({ name: 'epst_created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'epst_updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'epst_deleted_at' })
  deletedAt!: Date;

  @Column('text', { name: 'epst_title' })
  title!: string;

  @Column('text', { name: 'epst_codec' })
  codec!: string;

  @Column('text', { name: 'epst_language' })
  language!: string;

  @Column('boolean', { name: 'epst_external' })
  external!: boolean;

  @Column('boolean', { name: 'epst_forced' })
  forced!: boolean;
}

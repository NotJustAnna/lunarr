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
import { Show } from './Show';
import { ShowEpisode } from './ShowEpisode';
import { SonarrState } from '../enums/sonarrState';

@Entity('show_season')
@Index(['showId', 'seasonNumber'], { unique: true })
export class ShowSeason {
  @PrimaryGeneratedColumn('uuid', { name: 'shse_id' })
  @Index({ unique: true })
  id!: string;

  @CreateDateColumn({ name: 'shse_created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'shse_updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'shse_deleted_at' })
  deletedAt!: Date;

  @Column('text', { name: 'shse_jellyfin_id', unique: true, nullable: true })
  @Index({ unique: true })
  jellyfinId?: string;

  @Column('integer', { name: 'shse_number' })
  seasonNumber!: number;

  @Column('uuid', { name: 'show_id' })
  showId!: string;

  @Column({ name: 'shse_sonarr_state', type: 'enum', enum: SonarrState, default: SonarrState.NONE })
  sonarrState!: SonarrState;

  @ManyToOne(() => Show, show => show.seasons)
  @JoinColumn({ name: 'show_id' })
  show!: Show;

  @OneToMany(() => ShowEpisode, episode => episode.season)
  episodes!: ShowEpisode[];
}

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
import { Movie } from '../Movie';
import { JellyfinAudioTrack } from '../../interface/JellyfinAudioTrack';

@Entity('movie_audio_track')
export class MovieAudioTrack implements JellyfinAudioTrack {
  @PrimaryGeneratedColumn('uuid', { name: 'moat_id' })
  @Index({ unique: true })
  id!: string;

  @Column('uuid', { name: 'movi_id' })
  movieId!: string;

  @ManyToOne(() => Movie, movie => movie.jellyfinAudioTracks)
  @JoinColumn({ name: 'movi_id' })
  movie!: Movie;

  @CreateDateColumn({ name: 'moat_created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'moat_updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'moat_deleted_at' })
  deletedAt!: Date;

  @Column('text', { name: 'moat_title' })
  title!: string;

  @Column('text', { name: 'moat_codec' })
  codec!: string;

  @Column('text', { name: 'moat_language' })
  language!: string;

  @Column('text', { name: 'moat_channels' })
  channels!: number;

  @Column('text', { name: 'moat_bitrate' })
  bitrate!: number;

  @Column('text', { name: 'moat_sample_rate' })
  sampleRate!: number;
}

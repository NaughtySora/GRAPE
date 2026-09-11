import { UserRole } from '@/types';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'user' })
export class UserSchema {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: 'citext',
    unique: true,
  })
  email: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: 'text' })
  hash: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  first_name: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  last_name: string

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;
}
@Entity({ name: 'user_address' })
export class UserAddressSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  city: string;

  @Column({ type: 'text', nullable: true })
  state: string;

  @Column({ type: 'text' })
  zipcode: string;

  @Column({ type: 'text' })
  country: string;

  @Column({ type: 'text' })
  street_address: string;

  @OneToOne(() => UserSchema, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id', })
  user: UserSchema;
}
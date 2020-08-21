import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  ManyToOne,
} from "typeorm";
import { Collection } from "./Collection";
import { SerialNumber } from "./SerialNumber";

@Entity()
export class Card extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  imageUrl!: string;

  @Column()
  member!: string;

  @ManyToOne((type) => Collection)
  collection!: Collection;

  @Column()
  rarity!: number;

  @Column()
  description!: string;

  @Column()
  credit!: string;

  @OneToOne((type) => SerialNumber)
  @JoinColumn()
  serialNumber!: SerialNumber;
}

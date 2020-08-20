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
import { CardTag } from "./CardTag";
import { UserCard } from "./UserCard";

@Entity()
export class Card extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  image_url!: string;

  @Column({ type: "varchar" })
  member!: string;

  @ManyToOne((type) => Collection)
  collection!: Collection;

  @Column({ type: "int" })
  rarity!: number;

  @Column({ type: "varchar" })
  description!: string;

  @OneToMany((type) => CardTag, (tags) => tags.card)
  tags!: CardTag;
}

import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  ManyToOne,
} from "typeorm";
import { Card } from "./Card";

@Entity()
export class CardTag extends BaseEntity {
  @PrimaryGeneratedColumn()
  tagId!: number;

  @ManyToOne((type) => Card, (card) => card.tags)
  card!: Card;

  @Column({ type: "varchar" })
  tag!: string;
}

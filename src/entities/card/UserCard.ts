import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Card } from "./Card";

@Entity()
export class UserCard extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  serialNumber!: number;

  @Column({ type: "varchar" })
  discord_id!: string;

  @ManyToOne((type) => Card)
  card!: Card;

  @Column({ type: "int" })
  stars!: number;

  @Column({ type: "int" })
  hearts!: number;
}

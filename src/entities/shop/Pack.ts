import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  ManyToOne,
} from "typeorm";
import { Collection } from "../card/Collection";

@Entity()
export class Pack extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne((type) => Collection)
  collection!: Collection;

  @Column()
  name!: string;

  @Column({ type: "int", default: 0 })
  price!: number;

  @Column({ type: "boolean", default: true })
  active!: boolean;
}

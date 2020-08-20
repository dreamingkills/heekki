import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  ManyToMany,
} from "typeorm";
import { SerialNumber } from "./SerialNumber";
import { Card } from "./Card";

@Entity()
export class Collection extends BaseEntity {
  @ManyToMany((type) => Card)
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToOne((type) => SerialNumber)
  @JoinColumn()
  serialNumber!: SerialNumber;
}

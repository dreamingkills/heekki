import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Collection } from "./Collection";

@Entity()
export class SerialNumber extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: 0 })
  serialNumber!: number;
}

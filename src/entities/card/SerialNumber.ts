import { Entity, Column, BaseEntity, PrimaryColumn, OneToOne } from "typeorm";
import { Collection } from "./Collection";

@Entity()
export class SerialNumber extends BaseEntity {
  @PrimaryColumn()
  collection!: number;

  @Column()
  serialNumber!: number;
}

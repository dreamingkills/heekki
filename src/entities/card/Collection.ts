import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Collection extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: null, type: "varchar" })
  name!: string;
}

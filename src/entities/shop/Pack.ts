import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Pack extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: false })
  collection_id!: number;

  @Column({ type: "int", default: 0 })
  price!: number;

  @Column({ type: "boolean", default: true })
  active!: boolean;
}

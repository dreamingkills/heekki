import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Hug extends BaseEntity {
  @PrimaryGeneratedColumn()
  hugid!: number;

  @Column({ nullable: false })
  hugger!: string;

  @Column({ type: "varchar", nullable: false })
  victim!: string;

  @Column({ type: "bigint", nullable: false })
  date!: number;
}

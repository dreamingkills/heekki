import { Entity, Column, BaseEntity, PrimaryColumn } from "typeorm";

@Entity()
export class Hug extends BaseEntity {
  @PrimaryColumn({ nullable: false })
  hugger!: string;

  @Column({ type: "varchar" })
  victim!: string;

  @Column({ type: "varchar" })
  date!: string;
}

import { Entity, Column, BaseEntity, PrimaryColumn } from "typeorm";

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn({ nullable: false })
  discord_id!: string;

  @Column({ default: 0, type: "int" })
  daily_streak!: number;

  @Column({ default: 0, type: "int" })
  daily_last!: number;

  @Column({ default: 0, type: "bigint" })
  coins!: number;

  @Column({ default: 0, type: "bigint" })
  hearts!: number;

  @Column({ default: "No description set.", type: "varchar" })
  desc!: string;

  @Column({ default: 0, type: "int" })
  hugs_given!: number;

  @Column({ default: 0, type: "int" })
  hugs_received!: number;
}

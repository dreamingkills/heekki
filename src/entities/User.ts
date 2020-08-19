import { Entity, Column, BaseEntity, PrimaryColumn } from "typeorm";

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn({ nullable: false, type: "int" })
  discord_id!: number;

  @Column("int")
  daily_streak!: number;

  @Column("int")
  daily_last!: number;

  @Column("bigint")
  coins!: number;

  @Column("bigint")
  hearts!: number;

  @Column({ default: "No description set.", type: "varchar" })
  desc!: string;
}

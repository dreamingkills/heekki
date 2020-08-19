import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserCard extends BaseEntity {
  public static async heartsToLevel(hearts: number) {}

  @PrimaryGeneratedColumn()
  serial!: number;

  @Column({ type: "varchar" })
  discord_id!: string;

  @Column({ type: "int" })
  card_id!: number;

  @Column({ type: "int" })
  stars!: number;

  @Column({ type: "int" })
  hearts!: number;
}

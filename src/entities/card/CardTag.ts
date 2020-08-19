import { Entity, Column, BaseEntity, PrimaryColumn } from "typeorm";

@Entity()
export class CardTag extends BaseEntity {
  @PrimaryColumn()
  card_id!: number;

  @Column({ type: "varchar" })
  tag!: string;
}

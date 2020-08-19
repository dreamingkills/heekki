import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CardTag extends BaseEntity {
  @PrimaryGeneratedColumn()
  tag_id!: number;

  @Column()
  card_id!: number;

  @Column({ type: "varchar" })
  tag!: string;
}

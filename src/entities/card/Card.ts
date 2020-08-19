import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Card extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: null, type: "varchar" })
  image_url!: string;

  @Column({ type: "varchar" })
  member!: string;

  @Column({ type: "int" })
  collection!: number;

  @Column({ default: 0, type: "int" })
  rarity!: number;

  @Column({ default: 0, type: "varchar" })
  description!: string;
}

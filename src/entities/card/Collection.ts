import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
} from "typeorm";
import { Card } from "./Card";
import { CardImageData } from "./ImageData";

@Entity()
export class Collection extends BaseEntity {
  @ManyToMany(() => Card)
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToOne((type) => CardImageData)
  @JoinColumn()
  imageData!: CardImageData;
}

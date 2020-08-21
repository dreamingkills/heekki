import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { Collection } from "./Collection";
import { UserCard } from "./UserCard";
import { CollectionText } from "./text/CollectionText";
import { MemberText } from "./text/MemberText";
import { SerialText } from "./text/SerialText";
import { LevelText } from "./text/LevelText";
import { LevelNum } from "./text/LevelNum";
import { HeartText } from "./text/HeartText";
import { Card } from "./Card";

@Entity()
export class CardImageData extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  fontName!: string;

  @ManyToOne((type) => CollectionText)
  collectionText!: CollectionText;
  @ManyToOne((type) => MemberText)
  memberText!: MemberText;
  @ManyToOne((type) => SerialText)
  serialText!: SerialText;
  @ManyToOne((type) => LevelText)
  levelText!: LevelText;
  @ManyToOne((type) => LevelNum)
  levelNum!: LevelNum;
  @ManyToOne((type) => HeartText)
  heartText!: HeartText;

  @Column()
  starImageURL!: string;
  @Column()
  starStartingX!: number;
  @Column()
  starStartingY!: number;
  @Column()
  starSideLength!: number;
  @Column()
  starXIncrement!: number;
  @Column()
  starYIncrement!: number;
}

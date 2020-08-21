import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class LevelText extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  size!: number;
  @Column()
  color!: string;
  @Column()
  align!: "left" | "center" | "right";
  @Column()
  x!: number;
  @Column()
  y!: number;
}

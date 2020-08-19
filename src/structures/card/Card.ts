import { UserCard } from "../../entities/card/UserCard";
import { CardTag } from "../../entities/card/CardTag";
import { Card as CardEntity } from "../../entities/card/Card";
import { Collection } from "../../entities/card/Collection";

export class Card {
  card_id: number;
  serial: number;
  owner: string;
  level: number;
  hearts: number;

  image_url: string;
  member: string;
  collection: string;
  rarity: number;
  description: string;

  tags: string[];

  constructor(
    uc: UserCard,
    card: CardEntity,
    tags: CardTag[],
    coll: Collection
  ) {
    this.card_id = uc.card_id;
    this.serial = uc.serial;
    this.owner = uc.discord_id;
    this.level = uc.level;
    this.hearts = uc.hearts;
    this.image_url = card.image_url;
    this.member = card.member;

    this.collection = coll.name;
    this.rarity = card.rarity;
    this.description = card.description;
    this.tags = tags.map((tag) => tag.tag);
  }
}

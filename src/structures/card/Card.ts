import { UserCard } from "../../entities/card/UserCard";
import { Card as CardEntity } from "../../entities/card/Card";
import { Collection } from "../../entities/card/Collection";

export class Card {
  card_id: number;
  serial: number;
  owner: string;
  hearts: number;
  stars: number;

  image_url: string;
  member: string;
  collection: string;
  rarity: number;
  description: string;

  //tags: string[];

  constructor(uc: UserCard, card: CardEntity, coll: Collection) {
    this.card_id = uc.card.id;
    this.serial = uc.card.serialNumber.serialNumber + 1;
    this.owner = uc.discord_id;
    this.hearts = uc.hearts;
    this.image_url = card.imageUrl;
    this.member = card.member;
    this.stars = uc.stars;

    this.collection = coll.name;
    this.rarity = card.rarity;
    this.description = card.description;
    //console.log(tags);
    //this.tags = tags;
  }
}

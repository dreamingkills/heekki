import { stringify } from "querystring";
import { Card } from "../card/Card";

export class UserCard extends Card {
  userCardId: number;
  serialNumber: number;
  ownerId: string;
  stars: number;
  hearts: number;
  isFavorite: boolean;

  constructor(data: {
    card_id: number;
    user_card_id: number;
    owner_id: string;
    serial_number: number;
    stars: number;
    hearts: number;
    is_favorite: boolean;

    blurb: string;
    member: string;
    abbreviation: string;
    rarity: number;
    image_url: string;
    pack_id: number;
    serial_id: number;
    serial_limit: number;
  }) {
    super({
      id: data.card_id,
      blurb: data.blurb,
      member: data.member,
      abbreviation: data.abbreviation,
      rarity: data.rarity,
      image_url: data.image_url,
      pack_id: data.pack_id,
      serial_id: data.serial_id,
      serial_limit: data.serial_limit,
    });
    this.userCardId = data.user_card_id;
    this.serialNumber = data.serial_number;
    this.ownerId = data.owner_id;
    this.stars = data.stars;
    this.hearts = data.hearts;
    this.isFavorite = data.is_favorite;
  }
}

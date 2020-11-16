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
    serial_limit: number;
    serial_total: number;
    image_data_id: number;
  }) {
    super({ ...data });

    this.userCardId = data.user_card_id;
    this.serialNumber = data.serial_number;
    this.ownerId = data.owner_id;
    this.stars = data.stars;
    this.hearts = data.hearts;
    this.isFavorite = data.is_favorite;
  }
}

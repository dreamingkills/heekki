export class Card {
  cardId: number;
  blurb: string;
  member: string;
  abbreviation: string;
  rarity: number;
  imageUrl: string;
  packId: number;
  serialLimit: number;
  imageDataId: number;
  serialTotal: number;

  constructor(data: {
    card_id: number;
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
    this.cardId = data.card_id;
    this.blurb = data.blurb;
    this.member = data.member;
    this.abbreviation = data.abbreviation;
    this.rarity = data.rarity;
    this.imageUrl = data.image_url;
    this.packId = data.pack_id;
    this.serialLimit = data.serial_limit;
    this.imageDataId = data.image_data_id;
    this.serialTotal = data.serial_total;
  }
}

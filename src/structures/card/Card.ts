export class Card {
  id: number;
  blurb: string;
  member: string;
  abbreviation: string;
  rarity: number;
  imageUrl: string;
  packId: number;
  serialId: number;

  constructor(data: {
    id: number;
    blurb: string;
    member: string;
    abbreviation: string;
    rarity: number;
    image_url: string;
    pack_id: number;
    serial_id: number;
  }) {
    this.id = data.id;
    this.blurb = data.blurb;
    this.member = data.member;
    this.abbreviation = data.abbreviation;
    this.rarity = data.rarity;
    this.imageUrl = data.image_url;
    this.packId = data.pack_id;
    this.serialId = data.serial_id;
  }
}

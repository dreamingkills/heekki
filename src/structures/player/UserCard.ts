export class UserCard {
  userCardId: number;

  serialNumber: number;
  ownerId: string;
  stars: number;
  hearts: number;
  //Card
  blurb: string;
  member: string;
  credit: string;
  abbreviation: string;
  rarity: number;
  imageUrl: string;
  //collection
  title: string;
  imageDataId: number;

  constructor(data: {
    id: number;
    owner_id: string;
    serial_number: number;
    stars: number;
    hearts: number;

    blurb: string;
    member: string;
    credit: string;
    abbreviation: string;
    rarity: number;
    image_url: string;

    title: string;
    image_data_id: number;
  }) {
    this.userCardId = data.id;
    this.serialNumber = data.serial_number;
    this.ownerId = data.owner_id;
    this.stars = data.stars;
    this.hearts = data.hearts;

    this.blurb = data.blurb;
    this.member = data.member;
    this.credit = data.credit;
    this.abbreviation = data.abbreviation;
    this.rarity = data.rarity;
    this.imageUrl = data.image_url;

    this.title = data.title;
    this.imageDataId = data.image_data_id;
  }
}

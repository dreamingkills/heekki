export class Fish {
  identifier: string;
  owner: string;
  name: string;
  weight: number;
  emoji: string;
  modName: string;
  multiplier: number;
  price: number;

  constructor(data: {
    identifier: string;
    owner: string;
    name: string;
    weight: number;
    emoji: string;
    mod_name: string;
    multiplier: number;
    base_price: number;
    price_multiplier: number;
  }) {
    this.identifier = data.identifier;
    this.owner = data.owner;
    this.name = data.name;
    this.weight = data.weight;
    this.emoji = data.emoji;
    this.modName = data.mod_name;
    this.multiplier = data.multiplier;
    this.price = Math.round(data.base_price * data.price_multiplier);
  }
}

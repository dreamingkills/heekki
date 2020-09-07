export class ShopItem {
  id: number;
  title: string;
  price: number;
  active: boolean;
  packId: number;

  constructor(data: {
    id: number;
    title: string;
    price: number;
    active: boolean;
    pack_id: number;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.price = data.price;
    this.active = data.active;
    this.packId = data.pack_id;
  }
}

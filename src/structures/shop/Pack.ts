export class ShopItem {
  id: number;
  title: string;
  price: number;
  active: boolean;

  constructor(data: {
    id: number;
    title: string;
    price: number;
    active: boolean;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.price = data.price;
    this.active = data.active;
  }
}

export class ShopItem {
  id: number;
  keyword: string;
  title: string;
  price: number;
  active: boolean;
  credit: string;
  cover: string;
  flavorText: string;

  constructor(data: {
    id: number;
    keyword: string;
    title: string;
    price: number;
    active: boolean;
    credit: string;
    cover_url: string;
    flavor_text: string;
  }) {
    this.id = data.id;
    this.keyword = data.keyword;
    this.title = data.title;
    this.price = data.price;
    this.active = data.active;
    this.credit = data.credit;
    this.cover = data.cover_url;
    this.flavorText = data.flavor_text;
  }
}

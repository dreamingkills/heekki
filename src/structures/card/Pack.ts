export class Pack {
  id: number;
  title: string;
  credit: string;
  coverURL: string;
  flavorText: string;

  constructor(data: {
    id: number;
    title: string;
    credit: string;
    cover_url: string;
    flavor_text: string;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.credit = data.credit;
    this.coverURL = data.cover_url;
    this.flavorText = data.flavor_text;
  }
}

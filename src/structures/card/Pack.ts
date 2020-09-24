export class Pack {
  id: number;
  title: string;
  imageDataId: number;
  credit: string;
  coverURL: string;
  flavorText: string;

  constructor(data: {
    id: number;
    title: string;
    image_data_id: number;
    credit: string;
    cover_url: string;
    flavor_text: string;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.imageDataId = data.image_data_id;
    this.credit = data.credit;
    this.coverURL = data.cover_url;
    this.flavorText = data.flavor_text;
  }
}

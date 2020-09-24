export class Badge {
  title: string;
  blurb: string;
  emoji: string;
  id: number;
  constructor(data: {
    id: number;
    title: string;
    blurb: string;
    emoji: string;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.blurb = data.blurb;
    this.emoji = data.emoji;
  }
}

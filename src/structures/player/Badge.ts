export class Badge {
  title: string;
  blurb: string;
  emoji: string;
  constructor(data: { title: string; blurb: string; emoji: string }) {
    this.title = data.title;
    this.blurb = data.blurb;
    this.emoji = data.emoji;
  }
}

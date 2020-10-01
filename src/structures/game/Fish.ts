export class Fish {
  ownerId: string;
  name: string;
  weight: number;
  emoji: string;

  constructor(data: {
    discord_id: string;
    fish_name: string;
    fish_weight: number;
    emoji: string;
  }) {
    this.ownerId = data.discord_id;
    this.name = data.fish_name;
    this.weight = data.fish_weight;
    this.emoji = data.emoji;
  }
}

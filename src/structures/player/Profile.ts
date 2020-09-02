export class Profile {
  discord_id: string;
  blurb: string;
  coins: number;
  hearts: number;
  daily_streak: number;
  daily_last: number;
  constructor(data: {
    discord_id: string;
    daily_streak: number;
    daily_last: number;
    coins: number;
    hearts: number;
    blurb: string;
  }) {
    this.discord_id = data.discord_id;
    this.blurb = data.blurb;
    this.coins = data.coins;
    this.hearts = data.hearts;
    this.daily_streak = data.daily_streak;
    this.daily_last = data.daily_last;
  }
}

import { Badge } from "./Badge";

export class Profile {
  discord_id: string;
  blurb: string;
  coins: number;
  hearts: number;
  daily_streak: number;
  daily_last: number;
  xp: number;
  restricted: boolean;
  badges?: Badge[];
  constructor(
    data: {
      discord_id: string;
      daily_streak: number;
      daily_last: number;
      coins: number;
      hearts: number;
      blurb: string;
      xp: number;
      restricted: boolean;
    },
    badges?: Badge[]
  ) {
    this.discord_id = data.discord_id;
    this.blurb = data.blurb;
    this.coins = data.coins;
    this.hearts = data.hearts;
    this.daily_streak = data.daily_streak;
    this.daily_last = data.daily_last;
    this.badges = badges;
    this.xp = data.xp;
    this.restricted = data.restricted;
  }
}

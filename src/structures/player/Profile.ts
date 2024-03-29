import { ProfileInterface } from "../interface/ProfileInterface";
import { Badge } from "./Badge";

export class Profile {
  discord_id: string;
  blurb: string;
  coins: number;
  hearts: number;
  cardPriority: number;
  reputation: number;
  shards: number;

  xp: number;
  restricted: boolean;
  well: number;
  badges?: Badge[];

  dailyStreak: number;
  lastDaily: number;
  lastHeartBox: number;
  missionNext: number;
  lastOrphan: number;
  lastHeartSend: number;
  constructor(data: ProfileInterface, badges?: Badge[]) {
    this.discord_id = data.discord_id;
    this.blurb = data.blurb;
    this.coins = data.coins;
    this.hearts = data.hearts;
    this.badges = badges;
    this.xp = data.xp;
    this.restricted = data.restricted;
    this.well = data.well;
    this.cardPriority = data.use_card;
    this.reputation = data.reputation;
    this.shards = data.shards;

    this.dailyStreak = data.daily_streak;
    this.lastDaily = data.daily_last;
    this.lastHeartBox = data.heart_box_last;
    this.missionNext = data.mission_next;
    this.lastOrphan = data.last_orphan;
    this.lastHeartSend = data.hearts_last;
  }
}

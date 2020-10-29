export interface ProfileInterface {
  discord_id: string;
  blurb: string;
  coins: number;
  hearts: number;
  xp: number;
  restricted: boolean;
  well: number;
  use_card: number;
  reputation: number;

  daily_last: number;
  hearts_last: number;
  heart_box_last: number;
  last_orphan: number;
  mission_last: number;
}

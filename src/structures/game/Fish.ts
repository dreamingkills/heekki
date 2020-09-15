export class Fish {
  ownerId: string;
  name: string;
  weight: number;
  gender: "male" | "female" | "???";

  constructor(data: {
    discord_id: string;
    fish_name: string;
    fish_weight: number;
    gender: "male" | "female" | "???";
  }) {
    this.ownerId = data.discord_id;
    this.name = data.fish_name;
    this.weight = data.fish_weight;
    this.gender = data.gender;
  }
}

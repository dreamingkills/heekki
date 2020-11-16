import { CardService } from "../../database/service/CardService";
import { EdenInterface } from "../interface/EdenInterface";
import { UserCard } from "../player/UserCard";

export class Eden {
  id: number;
  discordId: string;
  cash: number;
  hourlyRate: number;
  cap: number;
  multiplier: number;
  multiplierEnds: number;
  HeeJin: UserCard | number;
  HyunJin: UserCard | number;
  HaSeul: UserCard | number;
  YeoJin: UserCard | number;
  Vivi: UserCard | number;
  "Kim Lip": UserCard | number;
  JinSoul: UserCard | number;
  Choerry: UserCard | number;
  Yves: UserCard | number;
  Chuu: UserCard | number;
  "Go Won": UserCard | number;
  "Olivia Hye": UserCard | number;

  public async convert() {
    if (this.HeeJin)
      this.HeeJin = await CardService.getUserCardById(this.HeeJin as number);
    if (this.HyunJin)
      this.HyunJin = await CardService.getUserCardById(this.HyunJin as number);
    if (this.HaSeul)
      this.HaSeul = await CardService.getUserCardById(this.HaSeul as number);
    if (this.YeoJin)
      this.YeoJin = await CardService.getUserCardById(this.YeoJin as number);
    if (this.Vivi)
      this.Vivi = await CardService.getUserCardById(this.Vivi as number);
    if (this["Kim Lip"])
      this["Kim Lip"] = await CardService.getUserCardById(
        this["Kim Lip"] as number
      );
    if (this.JinSoul)
      this.JinSoul = await CardService.getUserCardById(this.JinSoul as number);
    if (this.Choerry)
      this.Choerry = await CardService.getUserCardById(this.Choerry as number);
    if (this.Yves)
      this.Yves = await CardService.getUserCardById(this.Yves as number);
    if (this.Chuu)
      this.Chuu = await CardService.getUserCardById(this.Chuu as number);
    if (this["Go Won"])
      this["Go Won"] = await CardService.getUserCardById(
        this["Go Won"] as number
      );
    if (this["Olivia Hye"])
      this["Olivia Hye"] = await CardService.getUserCardById(
        this["Olivia Hye"] as number
      );
  }

  constructor(data: EdenInterface) {
    this.id = data.id;
    this.discordId = data.discord_id;
    this.cash = data.cash;
    this.hourlyRate = data.hourly_rate;
    this.cap = data.cap;
    this.multiplier = data.multiplier;
    this.multiplierEnds = data.multiplier_ends;
    this.HeeJin = data.heejin;
    this.HyunJin = data.hyunjin;
    this.HaSeul = data.haseul;
    this.YeoJin = data.yeojin;
    this.Vivi = data.vivi;
    this["Kim Lip"] = data.kimlip;
    this.JinSoul = data.jinsoul;
    this.Choerry = data.choerry;
    this.Yves = data.yves;
    this.Chuu = data.chuu;
    this["Go Won"] = data.gowon;
    this["Olivia Hye"] = data.oliviahye;
  }
}

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
  heejin: UserCard | number;
  hyunjin: UserCard | number;
  haseul: UserCard | number;
  yeojin: UserCard | number;
  vivi: UserCard | number;
  kimlip: UserCard | number;
  jinsoul: UserCard | number;
  choerry: UserCard | number;
  yves: UserCard | number;
  chuu: UserCard | number;
  gowon: UserCard | number;
  oliviahye: UserCard | number;

  public async convert() {
    if (this.heejin)
      this.heejin = await CardService.getUserCardById(this.heejin as number);
    if (this.hyunjin)
      this.hyunjin = await CardService.getUserCardById(this.hyunjin as number);
    if (this.haseul)
      this.haseul = await CardService.getUserCardById(this.haseul as number);
    if (this.yeojin)
      this.yeojin = await CardService.getUserCardById(this.yeojin as number);
    if (this.vivi)
      this.vivi = await CardService.getUserCardById(this.vivi as number);
    if (this.kimlip)
      this.kimlip = await CardService.getUserCardById(this.kimlip as number);
    if (this.jinsoul)
      this.jinsoul = await CardService.getUserCardById(this.jinsoul as number);
    if (this.choerry)
      this.choerry = await CardService.getUserCardById(this.choerry as number);
    if (this.yves)
      this.yves = await CardService.getUserCardById(this.yves as number);
    if (this.chuu)
      this.chuu = await CardService.getUserCardById(this.chuu as number);
    if (this.gowon)
      this.gowon = await CardService.getUserCardById(this.gowon as number);
    if (this.oliviahye)
      this.oliviahye = await CardService.getUserCardById(
        this.oliviahye as number
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
    this.heejin = data.heejin;
    this.hyunjin = data.hyunjin;
    this.haseul = data.haseul;
    this.yeojin = data.yeojin;
    this.vivi = data.vivi;
    this.kimlip = data.kimlip;
    this.jinsoul = data.jinsoul;
    this.choerry = data.choerry;
    this.yves = data.yves;
    this.chuu = data.chuu;
    this.gowon = data.gowon;
    this.oliviahye = data.oliviahye;
  }
}

import { Pack as PackStruct } from "../../structures/shop/Pack";
import { Pack } from "../../entities/shop/Pack";
import * as error from "../../structures/Error";
import { Collection } from "../../entities/card/Collection";
import { Card } from "../../entities/card/Card";
import { User } from "../../entities/player/User";
import Chance from "chance";
import { UserCard } from "../../entities/card/UserCard";

export class ShopService {
  private static cleanMention(m: string): string {
    return m.replace(/[\\<>@#&!]/g, "");
  }

  public static async getPackByID(id: number) {
    let pack = Pack.findOne({ id });
  }

  public static async getAllPacks(page: number): Promise<PackStruct[]> {
    let pack = await Pack.getRepository()
      .createQueryBuilder("pack")
      .skip(page * 10 - 10)
      .take(9)
      .where("active=TRUE")
      .getMany();
    let packList = [];
    for (let p of pack) {
      let coll = await Collection.findOne({ id: p.collection_id });
      let cardList = await Card.getRepository()
        .createQueryBuilder("card")
        .where(`collection=${p.collection_id}`)
        .getCount();

      if (cardList > 0) packList.push(new PackStruct(p, coll!));
    }
    return packList;
  }
  public static async newUserCard(card: Card, u: User): Promise<UserCard> {
    let chance = new Chance();

    let user_card = UserCard.create();
    user_card.card_id = card.id;
    user_card.discord_id = u.discord_id;
    user_card.hearts = 0;
    user_card.level = 1;
    user_card.stars = chance.weighted([1, 2, 3, 4, 5, 6], [6, 5, 4, 3, 2, 1]);
    user_card.save();
    return user_card;
  }
  public static async rollPack(
    pack_id: number,
    m: string
  ): Promise<{ card: Card; usercard: UserCard; user: User; coll: Collection }> {
    let user = await User.findOne({ where: { discord_id: m } });

    let pack = await Pack.findOne({ where: { id: pack_id } });
    if (!pack) throw new error.InvalidPackError();
    if (!pack.active) throw new error.ExpiredPackError();
    let coll = await Collection.findOne({ where: { id: pack?.collection_id } });
    if (!coll) throw new error.InvalidShopItemError();

    let struct = new PackStruct(pack, coll);
    if (struct.price > user!.coins) throw new error.NotEnoughCoinsError();

    let cardListRepo = Card.getRepository()
      .createQueryBuilder("card")
      .where(`collection=${struct.collection_id}`);
    let count = await cardListRepo.getCount();
    let cardList = await cardListRepo.getMany();
    if (count < 1) throw new error.InvalidPackError();

    let chance = new Chance();
    let chances = [];
    for (let card of cardList) {
      let adjustedRarity =
        card.rarity > 3 ? card.rarity * 3.33 : card.rarity * 0.33;
      chances.push(adjustedRarity);
    }
    let randomCard = chance.weighted(cardList, chances);

    let newCard = await this.newUserCard(randomCard, user!);

    user!.coins = +user!.coins - +struct.price;
    user?.save();
    return { card: randomCard, usercard: newCard, user: user!, coll };
  }
}

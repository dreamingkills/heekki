import { User } from "../../entities/player/User";
import { Card } from "../../entities/card/Card";
import { Card as CardStruct } from "../../structures/card/Card";
import { CardTag } from "../../entities/card/CardTag";
import { UserCard } from "../../entities/card/UserCard";
import * as error from "../../structures/Error";
import { Collection } from "../../entities/card/Collection";

export class PlayerService {
  private static cleanMention(m: string): string {
    return m.replace(/[\\<>@#&!]/g, "");
  }

  private static async userExists(m: string): Promise<boolean> {
    let discord_id = this.cleanMention(m);
    let user = await User.findOne({ discord_id });
    return user ? true : false;
  }

  public static async getProfileFromUser(
    m: string,
    p: boolean
  ): Promise<User | undefined> {
    let discord_id = this.cleanMention(m);
    let user = await User.findOne({ discord_id });
    if (!user) {
      if (p) throw new error.NoProfileOtherError();
      throw new error.NoProfileError();
    }

    return user;
  }

  public static async createNewUser(m: string): Promise<User> {
    let discord_id = this.cleanMention(m);
    if (await this.userExists(discord_id)) {
      throw new error.DuplicateProfileError();
    }

    let newUser = User.create();
    newUser.discord_id = discord_id;
    await newUser.save();
    return newUser;
  }

  public static async changeProfileDescription(
    m: string,
    desc: string
  ): Promise<User> {
    let discord_id = this.cleanMention(m);
    if (!(await this.userExists(m))) {
      throw new error.NoProfileError();
    }

    let user = await User.findOne({ discord_id });
    user!.desc = desc;
    await user?.save();
    return user!;
  }

  public static async getCardsByUser(
    m: string,
    p: boolean,
    page: number
  ): Promise<CardStruct[]> {
    if (page <= 0) throw new error.PageOutOfBoundsError();
    let discord_id = this.cleanMention(m);
    if (!(await this.userExists(discord_id))) {
      if (p) throw new error.NoProfileOtherError();
      throw new error.NoProfileError();
    }
    let cards = await UserCard.getRepository()
      .createQueryBuilder("user_card")
      .skip(page * 10 - 10)
      .take(10)
      .getMany();

    let cardList = [];
    for (let card of cards) {
      let meta = await Card.findOne({ id: card.card_id });
      let tags = await CardTag.find({ where: { card_id: card.card_id } });
      let coll = await Collection.findOne({ id: meta!.collection });

      cardList.push(new CardStruct(card, meta!, tags, coll!));
    }
    return cardList;
  }

  public static async hugUser(
    m: string,
    v: string | undefined
  ): Promise<number> {
    if (!v) throw new error.NobodyToHugError();
    let discord_user = this.cleanMention(v);
    if (discord_user == m) throw new error.CantHugYourselfError();
    if (!(await this.userExists(m))) {
      return 0;
    }
    if (!(await this.userExists(v))) {
      return 1;
    }
    let user = await this.getProfileFromUser(discord_user, false);
    let sender = await this.getProfileFromUser(m, true);
    user!.hearts = +user!.hearts + 3;
    sender!.hearts = +user!.hearts + 3;
    await user!.save();
    await sender!.save();
    return 2;
  }
}

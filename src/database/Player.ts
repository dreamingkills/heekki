import { User } from "../entities/player/User";
import { UserCard } from "../entities/card/UserCard";
import * as error from "../structures/Error";
import { Hug } from "../entities/player/Hug";

export class PlayerService {
  private static cleanMention(m: string): string {
    return m.replace(/[\\<>@#&!]/g, "");
  }

  private static async userExists(m: string): Promise<boolean> {
    let discord_id = this.cleanMention(m);
    let user = await User.findOne({ discord_id });
    return user ? true : false;
  }

  public static async getProfileFromUser(m: string, p: boolean): Promise<User> {
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
  ): Promise<{ cards: UserCard[]; total: number }> {
    if (page <= 0) throw new error.PageOutOfBoundsError();
    let discord_id = this.cleanMention(m);
    if (!(await this.userExists(discord_id))) {
      if (p) throw new error.NoProfileOtherError();
      throw new error.NoProfileError();
    }
    let cardQB = await UserCard.getRepository().find({
      relations: [
        "card",
        "card.collection",
        "card.collection.imageData",
        "card.collection.imageData.collectionText",
        "card.collection.imageData.memberText",
        "card.collection.imageData.serialText",
        "card.collection.imageData.levelText",
        "card.collection.imageData.levelNum",
        "card.collection.imageData.heartText",
        "card.serialNumber",
      ],
      where: { discord_id },
      order: { stars: "DESC", hearts: "DESC" },
    });

    return {
      cards: cardQB.slice(page * 5 - 5, page * 5),
      total: cardQB.length,
    };
  }

  public static async findLastHug(m: User, v: User): Promise<number> {
    let hug = await Hug.findOne({
      where: { hugger: m.discord_id, victim: v.discord_id },
      order: { date: "DESC" },
    });

    if (!hug) return 0;
    return hug.date;
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
    let victim = await this.getProfileFromUser(discord_user, false);
    let sender = await this.getProfileFromUser(m, true);

    let lastHug = await this.findLastHug(sender!, victim!);
    let eligible = Date.now() - 14400000;
    if (eligible < lastHug) {
      return +lastHug + 14400000;
    }

    victim!.hearts = +victim!.hearts + 3;
    victim!.hugs_received = +victim!.hugs_received + 1;
    sender!.hearts = +sender!.hearts + 3;
    sender!.hugs_given = +sender!.hugs_given + 1;
    await victim!.save();
    await sender!.save();
    let hug = Hug.create();
    hug.hugger = sender!.discord_id;
    hug.victim = victim!.discord_id;
    hug.date = Date.now();
    hug.save();
    return 2;
  }
}

import { User } from "../../entities/player/User";
import { Card } from "../../entities/card/Card";
import { Card as CardStruct } from "../../structures/card/Card";
import { UserCard } from "../../entities/card/UserCard";
import * as error from "../../structures/Error";
//import { Collection } from "../../entities/card/Collection";
import { Hug } from "../../entities/player/Hug";
import canvas, { CanvasRenderingContext2D } from "canvas";
import jimp from "jimp";
import { CollectionText } from "../../entities/card/text/CollectionText";
import { MemberText } from "../../entities/card/text/MemberText";
import { SerialText } from "../../entities/card/text/SerialText";
import { HeartText } from "../../entities/card/text/HeartText";
import { LevelNum } from "../../entities/card/text/LevelNum";
import { LevelText } from "../../entities/card/text/LevelText";

export class PlayerService {
  public static commafyNumber(num: number) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  public static heartsToLevel(hearts: number) {
    let unrounded = hearts / 50;
    let currentLevel = unrounded >= 1 ? Math.floor(unrounded) + 1 : 1;

    let nextRequirement = currentLevel * 50;
    let info = {
      totalHearts: hearts,
      level: currentLevel >= 99 ? 99 : currentLevel,
      next: currentLevel >= 99 ? -1 : nextRequirement,
      toNext: currentLevel >= 99 ? -1 : nextRequirement - hearts,
    };
    return info;
  }

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

  public static async getUserCard(
    collection: string,
    serial: number,
    discord_id: string
  ): Promise<UserCard> {
    let userCards = await UserCard.getRepository().find({
      where: { serialNumber: serial, discord_id },
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
    });
    for (let card of userCards) {
      if (card.card.collection.name == collection) return card;
    }
    throw new error.InvalidCardError();
  }

  public static async feedCard(
    member: string,
    card: string,
    amount: number
  ): Promise<{ card: UserCard; user: User; before: number }> {
    if (isNaN(amount)) throw new error.NotANumberError();
    let user = await this.getProfileFromUser(member, true);

    //Resolve Format#0000 to user card
    let [col, ser] = [card.split("#")[0], parseInt(card.split("#")[1])];
    let userCard = await this.getUserCard(col, ser, user!.discord_id);

    if (amount > user!.hearts) throw new error.NotEnoughHeartsError();
    const before = userCard.hearts;

    const clean = Math.floor(amount);
    user!.hearts = +user!.hearts - +clean;
    userCard.hearts = +userCard.hearts + +clean;
    await user!.save();
    await userCard.save();

    return { card: userCard, user: user!, before };
  }

  public static async generateText(
    ctx: CanvasRenderingContext2D,
    part:
      | CollectionText
      | MemberText
      | HeartText
      | LevelNum
      | LevelText
      | SerialText,
    font: string,
    text: string
  ) {
    ctx.font = `${part.size}px ${font}`;
    ctx.fillStyle = part.color;
    ctx.textAlign = part.align;
    ctx.fillText(text, part.x, part.y);
    return ctx;
  }

  public static async generateCardImage(
    member: string,
    card: string | UserCard
  ): Promise<Buffer> {
    let userCard;
    if (typeof card == "string") {
      userCard = await this.getUserCard(
        card.split("#")[0],
        parseInt(card.split("#")[1]),
        member
      );
    } else {
      userCard = card;
    }
    let read = await jimp.read(userCard.card.imageUrl);
    let size = { width: read.getWidth(), height: read.getHeight() };
    let buffer = await read.getBufferAsync(jimp.MIME_PNG);

    let cv = canvas.createCanvas(size.width, size.height);
    let ctx = cv.getContext("2d");
    let background = await canvas.loadImage(buffer);

    ctx.drawImage(background, 0, 0, size.width, size.height);

    let d = userCard.card.collection.imageData;
    //Collection name e.g. ViViD
    await this.generateText(
      ctx,
      d.collectionText,
      d.fontName,
      userCard.card.collection.name
    );
    //Member name e.g. HeeJin
    await this.generateText(
      ctx,
      d.memberText,
      d.fontName,
      userCard.card.member
    );
    //Serial Number e.g. #420
    await this.generateText(
      ctx,
      d.serialText,
      d.fontName,
      `#${this.commafyNumber(userCard.serialNumber)}`
    );
    //Level text
    await this.generateText(ctx, d.levelText, d.fontName, `Level`);
    //Level number
    await this.generateText(
      ctx,
      d.levelNum,
      d.fontName,
      this.heartsToLevel(userCard.hearts).level.toString()
    );
    //Heart count e.g. 99
    await this.generateText(
      ctx,
      d.heartText,
      d.fontName,
      this.commafyNumber(userCard.hearts)
    );

    let starData = await jimp.read(d.starImageURL);
    let star = await canvas.loadImage(
      await starData.getBufferAsync(jimp.MIME_PNG)
    );
    for (let i = 0; i < userCard.stars; i++) {
      ctx.drawImage(
        star,
        d.starStartingX + i * d.starXIncrement,
        d.starStartingY + i * d.starYIncrement,
        d.starSideLength,
        d.starSideLength
      );
    }

    let buf = cv.toBuffer("image/png");
    let final = Buffer.alloc(buf.length, buf, "base64");
    return final;
  }
}

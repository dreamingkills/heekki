import { UserCard } from "../entities/card/UserCard";
import { PlayerService } from "./Player";
import * as error from "../structures/Error";
import { User } from "../entities/player/User";
import canvas from "canvas";
import jimp from "jimp";
import { CollectionText } from "../entities/card/text/CollectionText";
import { MemberText } from "../entities/card/text/MemberText";
import { HeartText } from "../entities/card/text/HeartText";
import { LevelNum } from "../entities/card/text/LevelNum";
import { LevelText } from "../entities/card/text/LevelText";
import { SerialText } from "../entities/card/text/SerialText";
import { SelectQueryBuilder } from "typeorm";

export class CardService {
  public static memberShorthands: { [key: string]: string } = {
    he: "HeeJin",
    hj: "HyunJin",
    ha: "HaSeul",
    yj: "YeoJin",
    vv: "ViVi",
    kl: "Kim Lip",
    js: "JinSoul",
    cy: "Choerry",
    yv: "Yves",
    ch: "Chuu",
    gw: "Go Won",
    oh: "Olivia Hye",
  };
  private static commafyNumber(num: number) {
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

  public static async parseCardDetails(
    ref: string | UserCard,
    member: string
  ): Promise<UserCard> {
    if (typeof ref == "string") {
      let data = ref.split("#");
      let [collection, member, sn] = [
        data[0],
        data[1].slice(0, 2),
        parseInt(data[1].slice(2)),
      ];
      let usercard = await UserCard.getRepository()
        .createQueryBuilder("usercard")
        .leftJoinAndSelect(`usercard.card`, "card")
        .leftJoinAndSelect(`card.collection`, `collection`)
        .where(`serialNumber = :sn`, { sn })
        .andWhere(`card.member = :member`, {
          member: this.memberShorthands[member.toLowerCase()],
        })
        .andWhere(`collection.name = :collection`, { collection })
        .printSql()
        .getOne();
      if (!usercard) throw new error.InvalidUserCardError();
      return usercard;
    }

    return ref;
  }

  public static async upgradeCard(
    member: string,
    card: string,
    amount: number
  ): Promise<{ card: UserCard; user: User; before: number }> {
    if (isNaN(amount)) throw new error.NotANumberError();
    let user = await PlayerService.getProfileFromUser(member, true);
    const rounded = Math.floor(amount);
    if (rounded > user.hearts) throw new error.NotEnoughHeartsError();

    let userCard = await this.parseCardDetails(card, user.discord_id);
    const before = userCard.hearts;
    user.hearts = +user.hearts - +rounded;
    userCard.hearts = +userCard.hearts + +rounded;
    await user.save();
    await userCard.save();

    return { card: userCard, user: user, before };
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
    let userCard = await this.parseCardDetails(card, member);
    let read = await jimp.read(userCard.card.imageUrl);
    let size = { width: read.getWidth(), height: read.getHeight() };
    let buffer = await read.getBufferAsync(jimp.MIME_PNG);

    let cv = canvas.createCanvas(size.width, size.height);
    let ctx = cv.getContext("2d");
    let background = await canvas.loadImage(buffer);

    ctx.drawImage(background, 0, 0, size.width, size.height);

    let d = userCard.card.collection.imageData;
    await this.generateText(
      ctx,
      d.collectionText,
      d.fontName,
      userCard.card.collection.name
    );
    await this.generateText(
      ctx,
      d.memberText,
      d.fontName,
      userCard.card.member
    );
    await this.generateText(
      ctx,
      d.serialText,
      d.fontName,
      `#${this.commafyNumber(userCard.serialNumber)}`
    );
    await this.generateText(ctx, d.levelText, d.fontName, `Level`);
    await this.generateText(
      ctx,
      d.levelNum,
      d.fontName,
      this.heartsToLevel(userCard.hearts).level.toString()
    );
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

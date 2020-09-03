import { PlayerService } from "./Player";
import * as error from "../structures/Error";
import canvas from "canvas";
import jimp from "jimp";
import { UserCard } from "../structures/player/UserCard";
import { CardFetchSQL as Fetch, CardFetchSQL } from "./sql/card/Fetch";
import { ImageData } from "../structures/card/ImageData";

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
    ref: string
  ): Promise<{ card: UserCard; imageData: ImageData }> {
    let data = ref.split("#");
    let [abbr, sn] = [data[0], parseInt(data[1])];
    let userCard = await CardFetchSQL.getFullCardDataFromReference(abbr, sn);
    return userCard;
  }

  /*public static async upgradeCard(
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
  }*/

  public static async generateText(
    ctx: CanvasRenderingContext2D,
    part: {
      font: string;
      size: number;
      color: string;
      align: "left" | "center" | "right";
      x: number;
      y: number;
    },
    text: string
  ) {
    ctx.font = `${part.size}px ${part.font}`;
    ctx.fillStyle = part.color;
    ctx.textAlign = part.align;
    ctx.fillText(text, part.x, part.y);
    return ctx;
  }

  public static async generateCardImage(
    userCard: string
  ): Promise<{ image: Buffer; card: UserCard }>;
  public static async generateCardImage(userCard: {
    userCard: UserCard;
    imageData: ImageData;
  }): Promise<{ image: Buffer; card: UserCard }>;
  public static async generateCardImage(
    userCard: string | { userCard: UserCard; imageData: ImageData }
  ): Promise<{ image: Buffer; card: UserCard }> {
    let cardData;
    if (typeof userCard == "string") {
      cardData = await this.parseCardDetails(userCard);
    } else
      cardData = { card: userCard.userCard, imageData: userCard.imageData };

    let cardImage = await jimp.read(cardData.card.imageUrl);
    let size = { width: cardImage.getWidth(), height: cardImage.getHeight() };
    let buffer = await cardImage.getBufferAsync(jimp.MIME_PNG);

    let cv = canvas.createCanvas(size.width, size.height);
    let ctx = cv.getContext("2d");
    let background = await canvas.loadImage(buffer);

    ctx.drawImage(background, 0, 0, size.width, size.height);

    let d = cardData.imageData;

    let heartData = await jimp.read(d.heartImageUrl);
    let heart = await canvas.loadImage(
      await heartData.getBufferAsync(jimp.MIME_PNG)
    );
    ctx.drawImage(heart, d.heartX, d.heartY, d.heartLength, d.heartLength);
    await this.generateText(ctx, { ...d.packText }, cardData.card.title);
    await this.generateText(ctx, { ...d.memberText }, cardData.card.member);
    await this.generateText(
      ctx,
      { ...d.serialText },
      `#${this.commafyNumber(cardData.card.serialNumber)}`
    );
    await this.generateText(ctx, { ...d.levelText }, `Level`);
    await this.generateText(
      ctx,
      { ...d.levelNum },
      this.heartsToLevel(cardData.card.hearts).level.toString()
    );
    await this.generateText(
      ctx,
      { ...d.heartText },
      this.commafyNumber(cardData.card.hearts)
    );

    let starData = await jimp.read(d.starImageUrl);
    let star = await canvas.loadImage(
      await starData.getBufferAsync(jimp.MIME_PNG)
    );
    for (let i = 0; i < cardData.card.stars; i++) {
      ctx.drawImage(
        star,
        d.starStartingX + i * d.starXInc,
        d.starStartingY + i * d.starYInc,
        d.starLength,
        d.starLength
      );
    }

    let buf = cv.toBuffer("image/png");
    let final = Buffer.alloc(buf.length, buf, "base64");
    return { image: final, card: cardData.card };
  }
}

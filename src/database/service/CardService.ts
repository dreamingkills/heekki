import { PlayerService } from "./PlayerService";
import * as error from "../../structures/Error";
import canvas from "canvas";
import jimp from "jimp";
import { UserCard } from "../../structures/player/UserCard";
import { CardFetch } from "../sql/card/CardFetch";
import { ImageData } from "../../structures/card/ImageData";
import { Profile } from "../../structures/player/Profile";
import { CardUpdate } from "../sql/card/CardUpdate";
import { Card } from "../../structures/card/Card";

export class CardService {
  private static commafyNumber(num: number) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  public static heartsToLevel(hearts: number) {
    const unrounded = hearts / 50;
    const currentLevel = unrounded >= 1 ? Math.floor(unrounded) + 1 : 1;

    const nextRequirement = currentLevel * 50;
    return {
      totalHearts: hearts,
      level: currentLevel >= 99 ? 99 : currentLevel,
      next: currentLevel >= 99 ? -1 : nextRequirement,
      toNext: currentLevel >= 99 ? -1 : nextRequirement - hearts,
    };
  }

  public static async getCardsByPackId(pack_id: number): Promise<Card[]> {
    return await CardFetch.getCardsByPackId(pack_id);
  }

  public static async getCardDataFromReference(reference: {
    abbreviation: string;
    serial: number;
  }): Promise<{ userCard: UserCard; imageData: ImageData }> {
    if (isNaN(reference.serial))
      throw new error.InvalidUserCardError(reference);
    return await CardFetch.getFullCardDataFromReference(reference);
  }

  public static async generateCardImageFromReference(reference: {
    abbreviation: string;
    serial: number;
  }): Promise<{ image: Buffer; userCard: UserCard }> {
    if (isNaN(reference.serial))
      throw new error.InvalidUserCardError(reference);
    const card = await CardFetch.getFullCardDataFromReference(reference);
    return await this.generateCardImageFromUserCard({
      userCard: card.userCard,
      imageData: card.imageData,
    });
  }

  public static async upgradeCard(
    member: string,
    amount: number,
    reference: { abbreviation: string; serial: number }
  ): Promise<{ card: UserCard; user: Profile; before: number }> {
    if (isNaN(amount)) throw new error.NotANumberError();
    let user = await PlayerService.getProfileByDiscordId(member, false);
    const rounded = Math.floor(amount);
    if (rounded > user.hearts) throw new error.NotEnoughHeartsError();

    let userCard = await CardFetch.getFullCardDataFromReference(reference);
    if (userCard.userCard.ownerId != user.discord_id)
      throw new error.NotYourCardError();

    await CardUpdate.addHeartsToCard(userCard.userCard, amount);
    await PlayerService.removeHeartsFromUserByDiscordId(
      user.discord_id,
      amount
    );

    return {
      card: userCard.userCard,
      user: user,
      before: userCard.userCard.hearts,
    };
  }

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

  public static async generateCardImageFromUserCard(userCard: {
    userCard: UserCard;
    imageData: ImageData;
  }): Promise<{ image: Buffer; userCard: UserCard }> {
    const cardData = userCard.userCard;
    const imageData = userCard.imageData;

    let cardImage = await jimp.read(cardData.imageUrl);
    let size = { width: cardImage.getWidth(), height: cardImage.getHeight() };
    let buffer = await cardImage.getBufferAsync(jimp.MIME_PNG);

    let cv = canvas.createCanvas(size.width, size.height);
    let ctx = cv.getContext("2d");
    let background = await canvas.loadImage(buffer);

    ctx.drawImage(background, 0, 0, size.width, size.height);

    /*let heartData = await jimp.read(imageData.heartImageUrl);
    let heart = await canvas.loadImage(
      await heartData.getBufferAsync(jimp.MIME_PNG)
    );
    ctx.drawImage(
      heart,
      imageData.heartX,
      imageData.heartY,
      imageData.heartLength,
      imageData.heartHeight
    );*/

    //await this.generateText(ctx, { ...imageData.packText }, cardData.title);
    //await this.generateText(ctx, { ...imageData.memberText }, cardData.member);
    await this.generateText(
      ctx,
      { ...imageData.serialText },
      `#${this.commafyNumber(cardData.serialNumber)}`
    );
    //await this.generateText(ctx, { ...imageData.levelText }, `Level`);
    await this.generateText(
      ctx,
      { ...imageData.levelNum },
      this.heartsToLevel(cardData.hearts).level.toString()
    );
    await this.generateText(
      ctx,
      { ...imageData.heartText },
      this.commafyNumber(cardData.hearts)
    );

    let starData = await jimp.read(imageData.starImageUrl);
    let star = await canvas.loadImage(
      await starData.getBufferAsync(jimp.MIME_PNG)
    );
    for (let i = 0; i < userCard.userCard.stars; i++) {
      ctx.drawImage(
        star,
        imageData.starStartingX + i * imageData.starXInc,
        imageData.starStartingY + i * imageData.starYInc,
        imageData.starLength,
        imageData.starHeight
      );
    }

    let buf = cv.toBuffer("image/png");
    let final = Buffer.alloc(buf.length, buf, "base64");
    return { image: final, userCard: cardData };
  }
}

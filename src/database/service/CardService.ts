import canvas from "canvas";
import jimp from "jimp";
import { UserCard } from "../../structures/player/UserCard";
import { CardFetch } from "../sql/card/CardFetch";
import { ImageData } from "../../structures/card/ImageData";
import { CardUpdate } from "../sql/card/CardUpdate";
import { Pack } from "../../structures/card/Pack";
import { ShopItem } from "../../structures/shop/ShopItem";
import { Card } from "../../structures/card/Card";
import { TextInterface } from "../../structures/interface/image/TextInterface";

interface Reference {
  identifier: string;
  serial: number;
}

export class CardService {
  private static commafyNumber(num: number) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  public static heartsToLevel(hearts: number) {
    const unrounded = hearts / 150;
    const currentLevel = unrounded >= 1 ? Math.floor(unrounded) + 1 : 1;

    const nextRequirement = currentLevel * 150;
    return {
      totalHearts: hearts,
      level: currentLevel >= 99 ? 99 : currentLevel,
      next: currentLevel >= 99 ? -1 : nextRequirement,
      toNext: currentLevel >= 99 ? -1 : nextRequirement - hearts,
    };
  }

  public static async getCardsByPack(pack: Pack | ShopItem): Promise<Card[]> {
    return await CardFetch.getCardsByPack(pack);
  }

  public static async getCardDataFromReference(
    reference: Reference
  ): Promise<UserCard> {
    return await CardFetch.getUserCardByReference(reference);
  }

  public static async upgradeCard(
    amount: number,
    card: UserCard
  ): Promise<void> {
    await CardUpdate.addHeartsToCard(card, amount);
  }

  public static async getImageDataFromCard(card: UserCard): Promise<ImageData> {
    return await CardFetch.getImageDataFromCard(card);
  }

  /*
      Image Generation
                        */
  public static async generateText(
    ctx: CanvasRenderingContext2D,
    part: TextInterface,
    text: string
  ) {
    ctx.font = `${part.size}px ${part.font}`;
    ctx.fillStyle = part.color;
    ctx.textAlign = part.align;
    ctx.fillText(text, part.x, part.y);
    return ctx;
  }

  public static async generateCardImageFromUserCard(
    card: UserCard,
    imageData: ImageData
  ): Promise<Buffer> {
    let cardImage = await jimp.read(card.imageUrl);
    let size = { width: cardImage.getWidth(), height: cardImage.getHeight() };
    let buffer = await cardImage.getBufferAsync(jimp.MIME_PNG);

    let cv = canvas.createCanvas(size.width, size.height);
    let ctx = cv.getContext("2d");
    let background = await canvas.loadImage(buffer);

    ctx.drawImage(background, 0, 0, size.width, size.height);

    if (imageData.serialText.size > 0) {
      await this.generateText(
        ctx,
        { ...imageData.serialText },
        `#${this.commafyNumber(card.serialNumber)}`
      );
    }
    if (imageData.levelNum.size > 0) {
      await this.generateText(
        ctx,
        { ...imageData.levelNum },
        this.heartsToLevel(card.hearts).level.toString()
      );
    }
    if (imageData.heartText.size > 0) {
      await this.generateText(
        ctx,
        { ...imageData.heartText },
        this.commafyNumber(card.hearts)
      );
    }

    let starData = await jimp.read(imageData.starImageUrl);
    let star = await canvas.loadImage(
      await starData.getBufferAsync(jimp.MIME_PNG)
    );
    for (let i = 0; i < card.stars; i++) {
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
    return final;
  }

  public static async getRandomCard(): Promise<Card> {
    return await CardFetch.getRandomCard();
  }
}

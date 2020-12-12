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
import fs from "fs/promises";
import { Profile } from "../../structures/player/Profile";
import { Eden } from "../../structures/game/Eden";

interface Reference {
  identifier: string;
  serial: number;
}

export class CardService {
  public static heartsPerLevel: number = 300;
  public static heartsPerShard: number = 100;

  private static commafyNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  public static cardToReference(card: UserCard): string {
    return `${card.abbreviation}#${card.serialNumber}`;
  }

  public static getLevelCap(card: UserCard): number {
    return [15, 30, 45, 60, 75, 100][card.stars - 1];
  }

  public static calculateLevel(card: UserCard): number {
    const cap = [15, 30, 45, 60, 75, 100][card.stars - 1];

    const raw = Math.floor(card.hearts / this.heartsPerLevel);
    const adjusted = raw > cap ? cap : raw;
    return adjusted;
  }

  public static cardInEden(card: UserCard, eden: Eden): boolean {
    return eden[card.member as keyof typeof eden] === card.userCardId;
  }

  public static async getUserCardById(id: number): Promise<UserCard> {
    return await CardFetch.getUserCardById(id);
  }

  public static async transferCardToProfile(
    receiver: Profile,
    card: UserCard
  ): Promise<void> {
    return await CardUpdate.transferCardsToUser(receiver.discord_id, [card]);
  }

  public static async createNewUserCard(
    profile: Profile,
    card: Card,
    stars: number,
    hearts: number,
    force: boolean = false,
    price: number,
    free: boolean = false
  ): Promise<UserCard> {
    return await CardUpdate.createNewUserCard(
      profile,
      card,
      stars,
      hearts,
      force,
      price,
      free
    );
  }

  public static async toggleCardAsFavorite(card: UserCard): Promise<void> {
    return await CardUpdate.toggleCardAsFavorite(card.userCardId);
  }

  public static async forfeitCard(_: string, card: UserCard): Promise<void> {
    return await CardUpdate.forfeitCard(card);
  }

  public static async incrementCardStars(card: UserCard): Promise<UserCard> {
    return await CardUpdate.incrementCardStars(card);
  }

  public static async transferCards(
    recipient: string,
    cards: UserCard[]
  ): Promise<void> {
    return await CardUpdate.transferCardsToUser(recipient, cards);
  }

  public static async removeHeartsFromCard(
    card: UserCard,
    amount: number
  ): Promise<void> {
    return await CardUpdate.removeHeartsFromCard(card, amount);
  }

  public static async getCardsByPack(pack: Pack | ShopItem): Promise<Card[]> {
    return await CardFetch.getCardsByPack(pack);
  }

  public static async getCardDataFromReference(
    reference: Reference
  ): Promise<UserCard> {
    return await CardFetch.getUserCardByReference(reference);
  }

  public static async addHeartsToCard(
    card: UserCard,
    amount: number
  ): Promise<UserCard> {
    return await CardUpdate.addHeartsToCard(card, amount);
  }

  public static async getImageDataFromCard(card: UserCard): Promise<ImageData> {
    return await CardFetch.getImageDataFromCard(card);
  }

  public static async updateCardCache(card: UserCard): Promise<Buffer> {
    const imageData = await this.getImageDataFromCard(card);
    const image = await this.generateCardImageFromUserCard(card, imageData);

    try {
      await fs.mkdir(`./cache/cards/${card.cardId}`);
    } catch (e) {}
    await fs.writeFile(`./cache/cards/temp/${card.userCardId}`, image);
    await fs.rename(
      `./cache/cards/temp/${card.userCardId}`,
      `./cache/cards/${card.cardId}/${card.userCardId}`
    );
    return await fs.readFile(`./cache/cards/${card.cardId}/${card.userCardId}`);
  }

  public static async checkCacheForCard(card: UserCard): Promise<any> {
    try {
      return await fs.readFile(
        `./cache/cards/${card.cardId}/${card.userCardId}`
      );
    } catch (e) {
      return await this.updateCardCache(card);
    }
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
        this.calculateLevel(card).toString()
      );
    }
    if (imageData.heartText.size > 0) {
      await this.generateText(
        ctx,
        { ...imageData.heartText },
        this.commafyNumber(card.hearts) + (card.packId === 16 ? ` hearts` : ``)
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

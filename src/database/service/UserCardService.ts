import { CardFetch } from "../sql/card/CardFetch";
import { UserCard } from "../../structures/player/UserCard";
import { ImageData } from "../../structures/card/ImageData";
import { CardUpdate } from "../sql/card/CardUpdate";
import { PlayerService } from "./PlayerService";
import * as error from "../../structures/Error";

export class UserCardService {
  public static async getCardByUserCardId(
    id: number
  ): Promise<{ userCard: UserCard; imageData: ImageData }> {
    let fullCard = await CardFetch.getCardByUserCardId(id);
    return fullCard;
  }

  public static async transferCardToUserByDiscordId(
    receiver: string,
    cardId: number
  ): Promise<UserCard> {
    return await CardUpdate.transferCardToUser(receiver, cardId);
  }

  public static async createNewUserCard(
    discord_id: string,
    card_id: number,
    stars: number,
    hearts: number
  ): Promise<{ userCard: UserCard; imageData: ImageData }> {
    return await CardUpdate.createNewUserCard(
      discord_id,
      card_id,
      stars,
      hearts
    );
  }

  public static async forfeitCard(
    user: string,
    card: UserCard
  ): Promise<UserCard> {
    if (user != card.ownerId) throw new error.NotYourCardError();
    await CardUpdate.forfeitCard(card);
    return card;
  }

  public static async forfeitBulkUnderStars(
    user: string,
    stars: number
  ): Promise<number> {
    let owner = await PlayerService.getProfileByDiscordId(user, false);
    let cardsToForfeit = await PlayerService.getCardsByUser(owner.discord_id, {
      starsLessThan: stars,
    });
    let numberForfeited = 0;
    for (let card of cardsToForfeit) {
      await UserCardService.forfeitCard(owner.discord_id, card);
      numberForfeited++;
    }
    return numberForfeited;
  }

  public static async incrementCardStars(card_id: number): Promise<UserCard> {
    return await CardUpdate.incrementCardStars(card_id);
  }
}

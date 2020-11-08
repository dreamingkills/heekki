import { UserCard } from "../../structures/player/UserCard";
import { CardUpdate } from "../sql/card/CardUpdate";
import { PlayerService } from "./PlayerService";
import { MarketService } from "./MarketService";
import { Card } from "../../structures/card/Card";
import { Profile } from "../../structures/player/Profile";
import { CardFetch } from "../sql/card/CardFetch";
import { PlayerFetch } from "../sql/player/PlayerFetch";

export class UserCardService {
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

  public static async forfeitBulkUnderStars(
    profile: Profile,
    stars: number
  ): Promise<number> {
    let cardsToForfeit = await PlayerService.getCardsByProfile(profile, {
      maxstarsnoninclusive: stars,
    });
    let numberForfeited = 0;
    for (let card of cardsToForfeit) {
      if (card.isFavorite) continue;
      if ((await MarketService.cardIsOnMarketplace(card)).forSale) continue;
      await UserCardService.forfeitCard(profile.discord_id, card);
      numberForfeited++;
    }
    return numberForfeited;
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

  public static async getLastCard(profile: Profile): Promise<UserCard> {
    return await PlayerFetch.getLastCard(profile.discord_id);
  }
}

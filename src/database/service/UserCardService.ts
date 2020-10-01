import { UserCard } from "../../structures/player/UserCard";
import { CardUpdate } from "../sql/card/CardUpdate";
import { PlayerService } from "./PlayerService";
import * as error from "../../structures/Error";
import { MarketService } from "./MarketService";
import { Card } from "../../structures/card/Card";
import { Profile } from "../../structures/player/Profile";
import { CardFetch } from "../sql/card/CardFetch";

export class UserCardService {
  public static async getUserCardById(id: number): Promise<UserCard> {
    return await CardFetch.getUserCardById(id);
  }
  public static async transferCardToProfile(
    receiver: Profile,
    card: UserCard
  ): Promise<void> {
    await CardUpdate.transferCardToUser(receiver.discord_id, card);
  }

  public static async createNewUserCard(
    profile: Profile,
    card: Card,
    stars: number,
    hearts: number,
    force: boolean = false
  ): Promise<UserCard> {
    return await CardUpdate.createNewUserCard(
      profile.discord_id,
      card,
      stars,
      hearts,
      force
    );
  }

  public static async toggleCardAsFavorite(card: UserCard): Promise<void> {
    await CardUpdate.toggleCardAsFavorite(card.userCardId);
  }

  public static async forfeitCard(
    user: string,
    card: UserCard
  ): Promise<UserCard> {
    if (user != card.ownerId) throw new error.NotYourCardError();
    if (card.isFavorite) throw new error.FavoriteCardError();

    await CardUpdate.forfeitCard(card);
    return card;
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

  public static async incrementCardStars(card_id: number): Promise<void> {
    await CardUpdate.incrementCardStars(card_id);
  }

  public static async transferCard(
    recipient: string,
    card: UserCard
  ): Promise<void> {
    await CardUpdate.transferCardToUser(recipient, card);
  }
}

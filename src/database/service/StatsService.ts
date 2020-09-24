import { StatsUpdate } from "../sql/stats/StatsUpdate";
import { StatsFetch } from "../sql/stats/StatsFetch";
import { Stats } from "../../structures/game/Stats";
import { Profile } from "../../structures/player/Profile";

export class StatsService {
  public static async getNumberOfOrphanedCards(): Promise<number> {
    return await StatsFetch.getNumberOfOrphanedCards();
  }

  public static async getNumberOfCardsInMarketplace(): Promise<number> {
    return await StatsFetch.getNumberOfCardsInMarketplace();
  }

  public static async triviaComplete(
    profile: Profile,
    correct: boolean
  ): Promise<void> {
    StatsUpdate.triviaComplete(profile.discord_id, correct);
  }

  public static async missionComplete(
    profile: Profile,
    correct: boolean
  ): Promise<void> {
    StatsUpdate.missionComplete(profile.discord_id, correct);
  }

  public static async saleComplete(
    buyer: Profile,
    seller: string,
    card: string
  ): Promise<void> {
    StatsUpdate.saleComplete(buyer.discord_id, seller, card);
  }
}

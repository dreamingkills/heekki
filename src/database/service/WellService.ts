import { Profile } from "../../structures/player/Profile";
import { WellFetch } from "../sql/well/WellFetch";

export class WellService {
  public static async getWellTotal(): Promise<number> {
    return await WellFetch.getWellTotal();
  }

  public static async getTopDonators(limit: number = 10): Promise<Profile[]> {
    return await WellFetch.getTopDonators(limit);
  }

  public static async getWellRank(profile: Profile): Promise<number> {
    return await WellFetch.getWellRankByDiscordId(profile.discord_id);
  }
}

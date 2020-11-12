import { Profile } from "../../structures/player/Profile";
import { PlayerUpdate } from "../sql/player/PlayerUpdate";

export class AdminService {
  public static async giveBadgeToUser(
    discord_id: string,
    badge_id: number
  ): Promise<Profile> {
    return await PlayerUpdate.giveBadge(discord_id, badge_id);
  }
}

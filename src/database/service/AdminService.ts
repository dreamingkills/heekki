import { PlayerUpdate } from "../sql/player/PlayerUpdate";

export class AdminService {
  public static async giveBadgeToUser(
    discord_id: string,
    badge_id: number
  ): Promise<void> {
    return await PlayerUpdate.giveBadge(discord_id, badge_id);
  }
}

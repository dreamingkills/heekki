import * as error from "../../structures/Error";
import { PlayerUpdate } from "../sql/player/PlayerUpdate";
import { OkPacket } from "mysql";

export class AdminService {
  public static async giveBadgeToUser(
    discord_id: string,
    badge_id: number
  ): Promise<OkPacket> {
    return await PlayerUpdate.giveBadge(discord_id, badge_id);
  }
}

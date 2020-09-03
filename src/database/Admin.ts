import * as error from "../structures/Error";
import { PlayerModifySQL } from "./sql/player/Modify";
import { OkPacket } from "mysql";

export class AdminService {
  public static async giveBadgeToUser(
    discord_id: string,
    badge_id: number
  ): Promise<OkPacket> {
    return await PlayerModifySQL.giveBadge(discord_id, badge_id);
  }
}

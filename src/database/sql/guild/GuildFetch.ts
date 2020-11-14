import { DB, DBClass } from "../..";

export class GuildFetch extends DBClass {
  public static async setDropChannelId(
    guildId: string,
    channelId: string
  ): Promise<string> {
    await DB.query(`UPDATE guild SET drop_channel=? WHERE guild_id=?;`, [
      channelId,
      guildId,
    ]);
    return channelId;
  }
}

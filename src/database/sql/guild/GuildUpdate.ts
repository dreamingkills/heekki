import { DB, DBClass } from "../..";

export class GuildFetch extends DBClass {
  public static async getDropChannelId(guildId: string): Promise<string> {
    const query = (await DB.query(
      `SELECT drop_channel FROM guild WHERE guild_id=?;`,
      [guildId]
    )) as { guild_id: string }[];
    return query[0].guild_id;
  }
}

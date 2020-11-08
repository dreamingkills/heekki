import { Setting, Settings } from "../../../structures/settings/Settings";
import { DB, DBClass } from "../../index";
import { SettingFetch } from "./SettingFetch";

export class SettingUpdate extends DBClass {
  public static async createSetting(
    guild_id: string,
    name: Settings,
    value: string
  ): Promise<Setting> {
    await DB.query<any[]>(
      "INSERT INTO setting (guild_id, name, value) values (?, ?, ?)",
      [guild_id, name, value]
    );

    return (await SettingFetch.getSetting(guild_id, name))!;
  }

  public static async updateSetting(
    guild_id: string,
    name: string,
    value: string
  ) {
    await DB.query("UPDATE setting SET value=? WHERE guild_id=? AND name=?", [
      value,
      guild_id,
      name,
    ]);
  }
}

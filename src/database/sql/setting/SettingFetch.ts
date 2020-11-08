import {
  Setting,
  SettingInterface,
  Settings,
} from "../../../structures/settings/Settings";
import { DB, DBClass } from "../../index";

export class SettingFetch extends DBClass {
  public static async getSetting(
    guildID: string,
    settingName: Settings
  ): Promise<Setting | undefined> {
    let query = (await DB.query<any[]>(
      `
    SELECT *
    FROM setting
    WHERE guild_id=?
      AND name=?
    `,
      [guildID, settingName]
    )) as SettingInterface[];

    if (query.length) {
      return new Setting(query[0]);
    } else return undefined;
  }

  public static async listSetting(setting: Settings): Promise<Setting[]> {
    let query = (await DB.query<any[]>(
      `
    SELECT *
    FROM setting
    WHERE name=?
    `,
      [setting]
    )) as SettingInterface[];

    return query.map((s) => new Setting(s));
  }
}

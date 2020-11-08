import { Setting, Settings } from "../../structures/settings/Settings";
import { SettingFetch } from "../sql/setting/SettingFetch";
import { SettingUpdate } from "../sql/setting/SettingUpdate";

export class SettingService {
  public static async getSetting(
    guildID: string,
    settingName: Settings
  ): Promise<Setting | undefined> {
    return await SettingFetch.getSetting(guildID, settingName);
  }

  public static async updateSetting(
    guildID: string,
    name: Settings,
    value: string
  ): Promise<void> {
    await SettingUpdate.updateSetting(guildID, name, value);
  }

  public static async createSetting(
    guildID: string,
    name: Settings,
    value: string
  ): Promise<Setting> {
    return await SettingUpdate.createSetting(guildID, name, value);
  }

  public static async listPrefixes(): Promise<Setting[]> {
    return await SettingFetch.listSetting(Settings.Prefix);
  }
}

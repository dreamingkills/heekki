export enum Settings {
  Prefix = "prefix",
}

export interface SettingInterface {
  id: number;
  name: Settings;
  guild_id: string;
  value: string;
}

export class Setting {
  id: number;
  name: string;
  guildID: string;
  value: string;

  constructor(setting: SettingInterface) {
    this.id = setting.id;
    this.name = setting.name;
    this.guildID = setting.guild_id;
    this.value = setting.value;
  }
}

import { Message } from "discord.js";
import { SettingService } from "../../database/service/SettingService";
import { BaseCommand } from "../../structures/command/Command";
import { Settings } from "../../structures/settings/Settings";

export class Command extends BaseCommand {
  names: string[] = ["setting"];

  async exec(msg: Message) {
    if (!msg.member!.hasPermission("ADMINISTRATOR")) return;

    let [rawSettingName, settingValue] = this.options;

    if (!rawSettingName) {
      await msg.channel.send(
        `${this.config.discord.emoji.cross.full} Please specify a setting to modify!`
      );
      return;
    }

    let settingName = Object.values(Settings).find(
      (s) => s.toLowerCase() === rawSettingName.toLowerCase()
    );

    if (!settingName) {
      await msg.channel.send(
        `${
          this.config.discord.emoji.cross.full
        } That setting wasn't found! The available settings are: ${Object.values(
          Settings
        )
          .map((s) => `\`${s}\``)
          .join(", ")}`
      );
      return;
    }

    let existingSetting = await SettingService.getSetting(
      msg.guild!.id,
      settingName
    );

    if (!settingValue) {
      if (!existingSetting) {
        await msg.channel.send(
          `\`${settingName}\` isn't set in ${msg.guild!.name}!`
        );
      } else {
        await msg.channel.send(
          `\`${settingName}\` is set as \`${existingSetting.value}\``
        );
      }
    } else {
      if (existingSetting) {
        await SettingService.updateSetting(
          msg.guild!.id,
          settingName,
          settingValue
        );

        await msg.channel.send(
          `${this.config.discord.emoji.check.full} Updated \`${settingName}\` from ${existingSetting.value} to \`${settingValue}\`.`
        );
      } else {
        let setting = await SettingService.createSetting(
          msg.guild!.id,
          settingName,
          settingValue
        );

        await msg.channel.send(
          `${this.config.discord.emoji.check.full} Set \`${setting.name}\` as \`${setting.value}\`.`
        );
      }

      if (settingName === Settings.Prefix) {
        this.bot.setPrefix(msg.guild!.id, settingValue);
      }
    }
  }
}

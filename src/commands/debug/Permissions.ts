import { BaseCommand } from "../../structures/command/Command";
import { Message, MessageEmbed } from "discord.js";

export class Command extends BaseCommand {
  names: string[] = ["permissions", "perms"];
  async exec(msg: Message): Promise<void> {
    const embed = new MessageEmbed()
      .setAuthor(
        `Permissions Check | ${msg.author.tag}`,
        msg.author.displayAvatarURL()
      )
      .setColor(`#FFAACC`)
      .setDescription(
        `Heekki needs **all** of the following permissions to function properly.\nIf you see an ${this.config.discord.emoji.cross.full}, that means the bot is **missing** that permission.\n` +
          `\n${
            this.permissions.MANAGE_MESSAGES
              ? this.config.discord.emoji.check.full
              : this.config.discord.emoji.cross.full
          } **Manage Messages**` +
          `\n${
            this.permissions.ADD_REACTIONS
              ? this.config.discord.emoji.check.full
              : this.config.discord.emoji.cross.full
          } **Add Reactions**` +
          `\n${
            this.permissions.USE_EXTERNAL_EMOJI
              ? this.config.discord.emoji.check.full
              : this.config.discord.emoji.cross.full
          } **Use External Emoji**`
      );
    await msg.channel.send(embed);
  }
}

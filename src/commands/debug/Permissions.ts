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
        `Heekki needs **all** of the following permissions to function properly.\nIf you see an <:red_x:741454361007357993>, that means the bot is **missing** that permission.\n` +
          `\n${
            this.permissions.MANAGE_MESSAGES
              ? ":white_check_mark:"
              : `<:red_x:741454361007357993>`
          } **Manage Messages**` +
          `\n${
            this.permissions.ADD_REACTIONS
              ? ":white_check_mark:"
              : `<:red_x:741454361007357993>`
          } **Add Reactions**` +
          `\n${
            this.permissions.USE_EXTERNAL_EMOJI
              ? ":white_check_mark:"
              : `<:red_x:741454361007357993>`
          } **Use External Emoji**`
      );
    await msg.channel.send(embed);
  }
}

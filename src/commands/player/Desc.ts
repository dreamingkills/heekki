import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["desc"];
  async exec(msg: Message, executor: Profile) {
    let user = await PlayerService.changeProfileDescriptionByDiscordId(
      executor,
      this.options.join(" ")
    );

    await msg.channel.send(
      `${this.bot.config.discord.emoji.check.full} Your description was updated to:\n\`${user.new}\``
    );
  }
}

import { BaseCommand } from "../../structures/command/Command";
import { Message } from "discord.js";

export class Command extends BaseCommand {
  names: string[] = ["ping", "pong"];
  async exec(msg: Message): Promise<void> {
    await msg.channel.send(
      `${this.bot.config.discord.emoji.check.full} **ACCESS: OK**\nhttps://open.spotify.com/album/1QaUqc2Guft8ZUCW5mphtE`
    );
    return;
  }
}

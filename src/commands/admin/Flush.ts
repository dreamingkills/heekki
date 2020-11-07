import { Message } from "discord.js";
import { ConcurrencyService } from "../../helpers/Concurrency";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["avatar"];
  users: string[] = ["197186779843919877"];
  async exec(msg: Message) {
    ConcurrencyService.flushConcurrency();
    await msg.channel.send(
      `${this.config.discord.emoji.check.full} Flushed successfully.`
    );
  }
}

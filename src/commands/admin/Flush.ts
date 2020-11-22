import { Message } from "discord.js";
import { ConcurrencyService } from "../../helpers/Concurrency";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["$flush", "$fl"];
  description: string =
    "Globally resets command concurrency (jumble, memory, and trivia).";
  users: string[] = ["197186779843919877", "267794154459889664"];
  async exec(msg: Message) {
    ConcurrencyService.flushConcurrency();
    await msg.channel.send(
      `${this.bot.config.discord.emoji.check.full} Flushed successfully.`
    );
  }
}

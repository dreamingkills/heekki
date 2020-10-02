import { Message } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["docs", "help"];
  async exec(msg: Message) {
    msg.channel.send(
      "**Heekki Documentation**\nhttps://olivia-hye.github.io/heekki-docs/"
    );
  }
}

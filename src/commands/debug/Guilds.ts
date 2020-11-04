import { BaseCommand } from "../../structures/command/Command";
import { Message } from "discord.js";

export class Command extends BaseCommand {
  names: string[] = ["guilds"];
  users: string[] = ["197186779843919877"];
  async exec(msg: Message) {
    const desc = msg.client.guilds.cache.map((g) => {
      return `__**${g.name}**__ - ${g.memberCount}/<@${g.ownerID}>`;
    });
    console.log(desc);
  }
}

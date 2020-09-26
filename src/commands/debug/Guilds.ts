import { BaseCommand } from "../../structures/command/Command";
import { Message } from "discord.js";
import { Chance } from "chance";

export class Command extends BaseCommand {
  names: string[] = ["guilds"];
  users: string[] = ["197186779843919877"];
  exec = async (msg: Message) => {
    const desc = msg.client.guilds.cache.map((g) => {
      return `__**${g.name}**__\n**${g.memberCount}** members\n**Owner**: <@${g.ownerID}>\n`;
    });
    await msg.channel.send(desc);
  };
}

import { BaseCommand } from "../../structures/command/Command";
import { Message } from "discord.js";
import { Chance } from "chance";

export class Command extends BaseCommand {
  names: string[] = ["guilds"];
  users: string[] = ["197186779843919877"];
  exec = async (msg: Message) => {
    const desc = msg.client.guilds.cache.map((g) => {
      return `__**${g.name}**__\n**${g.memberCount}** members\n**Owner**: <@${
        g.ownerID
      }>\n<${g.iconURL()}>\n`;
    });
    const desc1 = desc.slice(0, 1900);
    const desc2 = desc.slice(1900, 3800);
    const desc3 = desc.slice(3800, 5700);
    await msg.channel.send(desc1);
    await msg.channel.send(desc2);
    await msg.channel.send(desc3);
  };
}

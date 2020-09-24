import { Message } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["h2l"];
  exec = async (msg: Message) => {
    let level = CardService.heartsToLevel(parseInt(this.options[0]));

    msg.channel.send(
      `**${level.totalHearts} hearts** is equal to **level ${level.level}**. **${level.toNext} hearts** to the next level (${level.next}).`
    );
  };
}

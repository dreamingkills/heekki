import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { CardService } from "../../database/service/CardService";

export class Command extends GameCommand {
  names: string[] = ["h2l"];
  usage: string[] = ["%c <hearts>"];
  desc: string = "Translates hearts to level.";
  category: string = "player";
  hidden: boolean = true;

  exec = async (msg: Message) => {
    let level = CardService.heartsToLevel(parseInt(this.prm[0]));

    msg.channel.send(
      `**${level.totalHearts} hearts** is equal to **level ${level.level}**. **${level.toNext} hearts** to the next level (${level.next}).`
    );
  };
}

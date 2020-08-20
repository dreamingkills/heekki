import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/player/Player";

export class Command extends GameCommand {
  names: string[] = ["h2l"];
  usage: string[] = ["%c <hearts>"];
  desc: string = "Translates hearts to level.";
  category: string = "player";
  hidden: boolean = true;

  exec = async (msg: Message) => {
    let level = await this.heartsToLevel(parseInt(this.prm[0]));

    await msg.channel.send(
      `**${level.totalHearts} hearts** is equal to **level ${level.level}**. **${level.toNext} hearts** to the next level (${level.next}).`
    );
    return;
  };
}

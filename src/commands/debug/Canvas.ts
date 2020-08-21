import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import canvas from "canvas";
import jimp from "jimp";
import { PlayerService } from "../../database/player/Player";

export class Command extends GameCommand {
  names: string[] = ["canvas"];
  usage: string[] = ["%c <hearts>"];
  desc: string = "Translates hearts to level.";
  category: string = "player";
  hidden: boolean = true;

  exec = async (msg: Message) => {
    let final = await PlayerService.generateCardImage(
      msg.author.id,
      this.prm[0]
    );
    await msg.channel.send("generated image", {
      files: [final],
    });
    return;
  };
}

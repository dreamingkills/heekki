import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/Player";

export class Command extends GameCommand {
  names: string[] = ["desc"];
  usage: string[] = ["%c <description>"];
  desc: string = "Sets the description on your profile.";
  category: string = "player";

  exec = async (msg: Message) => {
    let id = msg.author.id;
    let desc = this.prm.join(" ");
    let user = await PlayerService.changeProfileDescription(id, desc);

    await msg.channel.send(
      `:white_check_mark: Your description was updated to:\n\`${user.blurb}\``
    );
    return;
  };
}

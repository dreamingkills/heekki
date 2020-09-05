import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";

export class Command extends GameCommand {
  names: string[] = ["play"];
  usage: string[] = ["%c"];
  desc: string = "Creates a new profile.";
  category: string = "player";

  exec = async (msg: Message) => {
    await PlayerService.createNewUser(msg.author.id);
    msg.channel.send(
      `:white_check_mark: Successfully set up your profile! Use \`!profile\` to view it!`
    );
  };
}

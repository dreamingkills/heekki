import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { PlayerService } from "../../database/Player";

export class Command extends GameCommand {
  names: string[] = ["send"];
  usage: string[] = ["%c"];
  desc: string =
    "Sends 3 :heart: to everyone on your friends list. There is a delay of 3 hours until you can use the command again.";
  category: string = "player";

  exec = async (msg: Message) => {
    let sendHearts = await PlayerService.sendHeartsToFriends(msg.author.id);
    await msg.channel.send(
      `:white_check_mark: Hearts have been sent to **${sendHearts.length}** friends!`
    );
  };
}

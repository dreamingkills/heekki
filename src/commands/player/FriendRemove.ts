import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { PlayerService } from "../../database/Player";
import moment from "moment";

export class Command extends GameCommand {
  names: string[] = ["remove"];
  usage: string[] = ["%c <@mention>"];
  desc: string = "Remove someone from your friends list :broken_heart:";
  category: string = "player";

  exec = async (msg: Message) => {
    let newFriend = await PlayerService.removeFriend(
      msg.author.id,
      this.prm[0]
    );
    let member = msg.guild?.member(newFriend.discord_id);
    await msg.channel.send(
      `:white_check_mark: Removed **${member?.user.tag}** from your friends list!`
    );
  };
}

import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { PlayerService } from "../../database/Player";
import moment from "moment";

export class Command extends GameCommand {
  names: string[] = ["add"];
  usage: string[] = ["%c <@mention>"];
  desc: string = "Adds someone to your friends list!";
  category: string = "player";

  exec = async (msg: Message) => {
    let newFriend = await PlayerService.addFriend(msg.author.id, this.prm[0]);
    let member = msg.guild?.member(newFriend.discord_id);
    await msg.channel.send(
      `:white_check_mark: Added **${member?.user.tag}** as a friend!`
    );
  };
}

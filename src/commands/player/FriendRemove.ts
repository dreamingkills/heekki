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
    let friend;
    if (isNaN(parseInt(this.prm[0]))) {
      let un = this.prm[0].split("#")[0];
      let ds = this.prm[0].split("#")[1];
      let member = await msg.guild?.members.fetch({ query: un });
      friend = member?.firstKey();
    }
    let newFriend = await PlayerService.removeFriend(
      msg.author.id,
      friend || this.prm[0]
    );
    let member = msg.guild?.member(newFriend.discord_id.toString());
    await msg.channel.send(
      `:white_check_mark: Removed **${member?.user.tag}** from your friends list!`
    );
  };
}

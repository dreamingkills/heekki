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
    let friend;
    if (isNaN(parseInt(this.prm[0]))) {
      let un = this.prm[0].split("#")[0];
      let ds = this.prm[0].split("#")[1];
      let member = await msg.guild?.members.fetch({ query: un });
      friend = member?.firstKey();
    }

    if (!friend) {
      await msg.channel.send(
        "<:red_x:741454361007357993> Sorry, but I couldn't find that user."
      );
      return;
    }
    let newFriend = await PlayerService.addFriend(
      msg.author.id,
      friend || this.prm[0]
    );
    let member = msg.guild?.member(newFriend.discord_id.toString());
    await msg.channel.send(
      `:white_check_mark: Added **${member?.user.tag}** as a friend!`
    );
  };
}

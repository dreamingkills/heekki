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
    if (!this.prm[0]) {
      await msg.channel.send(
        `<:red_x:741454361007357993> Please specify a user to add!`
      );
      return;
    }
    let friend;
    if (isNaN(parseInt(this.prm[0])) && !this.prm[0].includes("<@")) {
      let member = await msg.guild?.members.fetch({ query: this.prm[0] });
      friend = member?.firstKey();
    } else {
      friend = (await PlayerService.getProfileFromUser(this.prm[0], true))
        .discord_id;
    }

    if (!friend) {
      await msg.channel.send(
        "<:red_x:741454361007357993> Sorry, but I couldn't find that user."
      );
      return;
    }
    let newFriend = await PlayerService.addFriend(msg.author.id, friend);
    let member = msg.guild?.member(newFriend.discord_id.toString());
    await msg.channel.send(
      `:white_check_mark: Added **${member?.user.tag}** as a friend!`
    );
  };
}

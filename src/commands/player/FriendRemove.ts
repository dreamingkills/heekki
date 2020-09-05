import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";

export class Command extends GameCommand {
  names: string[] = ["remove"];
  usage: string[] = ["%c <@mention>"];
  desc: string = "Remove someone from your friends list :broken_heart:";
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
    let newFriend = await PlayerService.removeFriend(msg.author.id, friend);
    let member = msg.guild?.member(newFriend.discord_id.toString());
    await msg.channel.send(
      `:white_check_mark: Removed **${member?.user.tag}** from your friends list!`
    );
  };
}

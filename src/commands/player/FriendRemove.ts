import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { FriendService } from "../../database/service/FriendService";

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
      const member = await msg.guild?.members.fetch({ query: this.prm[0] });
      friend = member?.firstKey();
      if (!friend) {
        await msg.channel.send(
          "<:red_x:741454361007357993> Sorry, but I couldn't find that user."
        );
        return;
      }
    } else {
      friend = this.parseMention(this.prm[0]);
    }

    const removedFriend = await FriendService.removeFriendByDiscordId(
      msg.author.id,
      friend
    );

    const oldUser = await msg.client.users.fetch(
      removedFriend.friend.discord_id
    );
    await msg.channel.send(
      `:white_check_mark: Removed **${oldUser?.tag}** from your friends list!`
    );
  };
}

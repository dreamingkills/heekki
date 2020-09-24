import { Message } from "discord.js";
import { FriendService } from "../../database/service/FriendService";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["add"];
  exec = async (msg: Message, executor: Profile) => {
    if (!this.options[0]) {
      msg.channel.send(
        `<:red_x:741454361007357993> Please specify a user to add!`
      );
      return;
    }
    let friend;

    if (!this.options[0].includes("<@")) {
      const member = await msg.guild?.members.fetch({
        query: this.options.join(" "),
      });
      friend = member?.firstKey();
      if (!friend) {
        await msg.channel.send(
          "<:red_x:741454361007357993> Sorry, but I couldn't find that user."
        );
        return;
      }
    } else {
      friend = this.parseMention(this.options[0]);
    }

    const friendProfile = await PlayerService.getProfileByDiscordId(friend);
    const newFriend = await FriendService.addFriendByDiscordId(
      executor,
      friendProfile
    );

    const newUser = await msg.client.users.fetch(newFriend.friend.discord_id);
    msg.channel.send(
      `:white_check_mark: Added **${newUser?.tag}** as a friend!`
    );
  };
}

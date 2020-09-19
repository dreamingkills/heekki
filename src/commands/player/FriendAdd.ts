import { Message } from "discord.js";
import { FriendService } from "../../database/service/FriendService";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["add"];
  usage: string[] = ["%c <@mention>"];
  desc: string = "Adds someone to your friends list!";
  category: string = "player";

  exec = async (msg: Message) => {
    if (!this.options[0]) {
      msg.channel.send(
        `<:red_x:741454361007357993> Please specify a user to add!`
      );
      return;
    }
    let friend;

    if (isNaN(parseInt(this.options[0])) && !this.options[0].includes("<@")) {
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

    const newFriend = await FriendService.addFriendByDiscordId(
      msg.author.id,
      friend
    );

    const newUser = await msg.client.users.fetch(newFriend.friend.discord_id);
    msg.channel.send(
      `:white_check_mark: Added **${newUser?.tag}** as a friend!`
    );
  };
}

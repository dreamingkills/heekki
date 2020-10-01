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
    if (executor.discord_id == friendProfile.discord_id) {
      msg.channel.send(
        "<:red_x:741454361007357993> You can't add yourself as a friend."
      );
      return;
    }

    const relationship = await FriendService.checkRelationshipExists(
      executor,
      friendProfile
    );
    console.log(relationship);
    switch (relationship) {
      case "ACCEPTABLE": {
        await FriendService.acceptFriendRequest(friendProfile, executor);
        msg.channel.send(`:white_check_mark: Friend request accepted.`);
        return;
      }
      case "REQUESTED": {
        msg.channel.send(
          `<:red_x:741454361007357993> You've already sent a friend request to that user!`
        );
        return;
      }
      case "ALREADY_FRIENDS": {
        msg.channel.send(
          `<:red_x:741454361007357993> You're already friends with them!`
        );
        return;
      }
      case "ERROR": {
        msg.channel.send(
          `<:red_x:741454361007357993> An unexpected error occurred! Please try again.`
        );
        return;
      }
    }

    const newFriend = await FriendService.addFriend(executor, friendProfile);

    const newUser = await msg.client.users.fetch(friendProfile.discord_id);
    msg.channel.send(
      `:white_check_mark: Sent a friend request to **${newUser?.tag}**!`
    );
  };
}

import { Message } from "discord.js";
import { FriendService } from "../../database/service/FriendService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["send"];
  exec = async (msg: Message, executor: Profile) => {
    const sendHearts = await FriendService.sendHeartsToFriends(executor);
    msg.channel.send(
      `:white_check_mark: Hearts have been sent to **${sendHearts.length}** friends!`
    );
  };
}

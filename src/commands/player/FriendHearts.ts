import { Message } from "discord.js";
import { FriendService } from "../../database/service/FriendService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import Chance from "chance";
import { PlayerService } from "../../database/service/PlayerService";

export class Command extends BaseCommand {
  names: string[] = ["send"];
  exec = async (msg: Message, executor: Profile) => {
    const sendHearts = await FriendService.sendHeartsToFriends(executor);

    const chance = new Chance();
    const xp = chance.integer({ min: 40, max: 85 });
    PlayerService.addXp(executor, xp);

    msg.channel.send(
      `:white_check_mark: Hearts have been sent to **${sendHearts.length}** friends!\n+ **${xp}** XP`
    );
  };
}

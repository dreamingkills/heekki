import { Message } from "discord.js";
import { FriendService } from "../../database/service/FriendService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import Chance from "chance";
import { PlayerService } from "../../database/service/PlayerService";
import * as error from "../../structures/Error";

export class Command extends BaseCommand {
  names: string[] = ["send"];
  exec = async (msg: Message, executor: Profile) => {
    const last = await PlayerService.getLastHeartSend(executor);
    const now = Date.now();
    if (now < last + 3600000) {
      throw new error.SendHeartsCooldownError(last + 3600000, now);
    }
    const friendsRaw = await FriendService.getFriendsByProfile(executor);
    const friends = friendsRaw.map((f) => {
      return f.sender === msg.author.id ? f.recipient : f.sender;
    });

    if (friends.length === 0) {
      msg.channel.send(
        `<:red_x:741454361007357993> You can't send hearts because you have no friends!`
      );
      return;
    }
    await FriendService.sendHearts(executor, friends);
    PlayerService.setLastHeartSend(executor, now);
    const chance = new Chance();
    const xp = chance.integer({ min: 40, max: 85 });
    PlayerService.addXp(executor, xp);

    msg.channel.send(
      `<:heekki_heart:757147742383505488> You've sent hearts to **${friends.length}** friends!\n+ **${xp}** XP`
    );
  };
}

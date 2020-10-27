import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["rep"];
  async exec(msg: Message, executor: Profile) {
    if (!msg.mentions.users.first()) {
      msg.channel.send(`<:red_x:741454361007357993> Please mention a user!`);
      return;
    }
    const receiverUser = msg.mentions.users.first()!;
    if (receiverUser.id === msg.author.id) {
      msg.channel.send(
        `<:red_x:741454361007357993> You can't give reputation to yourself.`
      );
      return;
    }

    const receiverProfile = await PlayerService.getProfileByDiscordId(
      receiverUser.id
    );

    const reputationExists = await PlayerService.checkReputation(
      executor,
      receiverProfile
    );
    if (reputationExists) {
      msg.channel.send(
        `<:red_x:741454361007357993> You've already given a reputation point to **${receiverUser.tag}**!`
      );
      return;
    }

    await PlayerService.giveReputation(executor, receiverProfile);
    msg.channel.send(
      `:white_check_mark: You gave a reputation point to **${receiverUser.tag}**!`
    );
  }
}

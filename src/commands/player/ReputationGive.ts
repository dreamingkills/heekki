import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["rep"];
  exec = async (msg: Message, executor: Profile) => {
    if (!msg.mentions.users.first()) {
      msg.channel.send(`:x: Please mention a user!`);
      return;
    }
    const receiverUser = msg.mentions.users.first()!;
    if (receiverUser.id === msg.author.id) {
      msg.channel.send(`:x: You can't give reputation to yourself.`);
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
        `:x: You've already given a reputation point to **${receiverUser.tag}**!`
      );
      return;
    }

    await PlayerService.giveReputation(executor, receiverProfile);
    msg.channel.send(
      `:white_check_mark: You gave a reputation point to **${receiverUser.tag}**!`
    );
  };
}

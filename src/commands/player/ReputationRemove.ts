import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["unrep"];
  exec = async (msg: Message, executor: Profile) => {
    if (!msg.mentions.users.first()) {
      msg.channel.send(`:x: Please mention a user!`);
      return;
    }
    const receiverUser = msg.mentions.users.first()!;
    if (receiverUser.id === msg.author.id) {
      msg.channel.send(`:x: Why would you want to do that? :broken_heart:`);
      return;
    }

    const receiverProfile = await PlayerService.getProfileByDiscordId(
      receiverUser.id
    );

    const reputationExists = await PlayerService.checkReputation(
      executor,
      receiverProfile
    );
    if (!reputationExists) {
      msg.channel.send(`:x: You haven't given them a reputation point.`);
      return;
    }

    await PlayerService.removeReputation(executor, receiverProfile);
    msg.channel.send(
      `:white_check_mark: You revoked your reputation point from **${receiverUser.tag}**!`
    );
  };
}

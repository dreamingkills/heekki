import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["unrep"];
  async exec(msg: Message, executor: Profile) {
    if (!msg.mentions.users.first()) {
      await msg.channel.send(
        `${this.config.discord.emoji.cross.full} Please mention a user!`
      );
      return;
    }
    const receiverUser = msg.mentions.users.first()!;
    if (receiverUser.id === msg.author.id) {
      await msg.channel.send(
        `${this.config.discord.emoji.cross.full} Why would you want to do that? :broken_heart:`
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
    if (!reputationExists) {
      await msg.channel.send(
        `${this.config.discord.emoji.cross.full} You haven't given them a reputation point.`
      );
      return;
    }

    await PlayerService.removeReputation(executor, receiverProfile);
    await msg.channel.send(
      `${this.config.discord.emoji.check.full} You revoked your reputation point from **${receiverUser.tag}**!`
    );
  }
}

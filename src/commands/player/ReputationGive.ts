import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["rep"];
  disabled: boolean = true;
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
        `${this.config.discord.emoji.cross.full} You can't give reputation to yourself.`
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
      await msg.channel.send(
        `${this.config.discord.emoji.cross.full} You've already given a reputation point to **${receiverUser.tag}**!`
      );
      return;
    }

    await PlayerService.giveReputation(executor, receiverProfile);
    await msg.channel.send(
      `${this.config.discord.emoji.check.full} You gave a reputation point to **${receiverUser.tag}**!`
    );
  }
}

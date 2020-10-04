import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["restrict"];
  users: string[] = ["197186779843919877"];
  async exec(msg: Message) {
    const restrictee = msg.mentions.users.first();
    if (!restrictee || restrictee.id === msg.author.id) {
      msg.channel.send(":warning: Please mention a valid user.");
      return;
    }

    const restricteeProfile = await PlayerService.getProfileByDiscordId(
      restrictee.id,
      false
    );
    await PlayerService.toggleRestriction(restricteeProfile);

    if (restricteeProfile.restricted) {
      msg.channel.send(
        `:white_check_mark: Unrestricted **${restrictee.tag}**.`
      );
    } else {
      msg.channel.send(`:white_check_mark: Restricted **${restrictee.tag}**.`);
    }
  }
}

import { Message } from "discord.js";
import { AdminService } from "../../database/service/AdminService";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["$mb"];
  users: string[] = ["197186779843919877"];
  async exec(msg: Message) {
    const victim = msg.mentions.members!.first();
    if (!victim) {
      await msg.channel.send(`:warning: Couldn't find that user.`);
      return;
    }
    const profile = await PlayerService.getProfileByDiscordId(victim.id);
    const amount = parseInt(this.options[1]);
    if (isNaN(amount) || amount === 0) {
      await msg.channel.send(`:warning: Please enter a valid amount.`);
      return;
    }

    await PlayerService.addCoinsToProfile(profile, amount);
    await msg.channel.send(
      `:white_check_mark: Modified **${
        victim.user.tag
      }**'s balance by **${amount.toLocaleString()}**.\nNew balance: **${(
        profile.coins + amount
      ).toLocaleString()}**`
    );
    return;
  }
}

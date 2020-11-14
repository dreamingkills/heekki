import { Message } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["using"];
  async exec(msg: Message, executor: Profile) {
    if (executor.cardPriority === 0) {
      await msg.channel.send(
        `${this.config.discord.emoji.cross.full} You haven't set a card to use.`
      );
      return;
    }

    const card = await CardService.getUserCardById(executor.cardPriority);

    await msg.channel.send(
      `${this.config.discord.emoji.cards.full} You're currently using **${card.abbreviation}#${card.serialNumber}** by default.`
    );
    return;
  }
}

import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import * as error from "../../structures/Error";
import { CardService } from "../../database/service/CardService";

export class Command extends BaseCommand {
  names: string[] = ["use"];
  async exec(msg: Message, executor: Profile) {
    const reference = {
      identifier: this.options[0]?.split("#")[0],
      serial: parseInt(this.options[0]?.split("#")[1]),
    };
    if (!reference.identifier) {
      await PlayerService.unsetDefaultCard(executor);
      await msg.channel.send(
        `:white_check_mark: You're no longer using a card by default.`
      );
      return;
    }
    if (isNaN(reference.serial)) throw new error.InvalidCardReferenceError();

    const card = await CardService.getCardDataFromReference(reference);
    if (card.ownerId !== executor.discord_id)
      throw new error.NotYourCardError(reference);

    await PlayerService.useCard(card, executor);

    msg.channel.send(
      `:white_check_mark: Now using **${card.abbreviation}#${card.serialNumber}** by default.`
    );
  }
}

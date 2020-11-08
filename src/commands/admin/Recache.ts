import { Message } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { BaseCommand } from "../../structures/command/Command";
import * as error from "../../structures/Error";

export class Command extends BaseCommand {
  names: string[] = ["$redraw"];
  users: string[] = ["197186779843919877"];
  async exec(msg: Message) {
    const reference = {
      identifier: this.options[0]?.split("#")[0],
      serial: parseInt(this.options[0]?.split("#")[1]),
    };
    if (isNaN(reference.serial)) throw new error.InvalidCardReferenceError();
    const card = await CardService.getCardDataFromReference(reference);

    await CardService.updateCardCache(card);
    await msg.channel.send(
      `${this.config.discord.emoji.check.full} Successfully re-cached **${card.abbreviation}#${card.serialNumber}**.`
    );
    return;
  }
}

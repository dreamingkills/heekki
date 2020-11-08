import { Message } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { BaseCommand } from "../../structures/command/Command";
import * as error from "../../structures/Error";
import { UserCardService } from "../../database/service/UserCardService";

export class Command extends BaseCommand {
  names: string[] = ["prestige"];
  async exec(msg: Message) {
    const reference = {
      identifier: this.options[0]?.split("#")[0],
      serial: parseInt(this.options[0]?.split("#")[1]),
    };
    if (isNaN(reference.serial)) throw new error.InvalidCardReferenceError();
    const card = await CardService.getCardDataFromReference(reference);

    if (card.ownerId !== msg.author.id)
      throw new error.NotYourCardError(reference);
    if (card.stars >= 6) throw new error.MaxPrestigeError(reference);
    if (card.hearts < 14700)
      throw new error.NotEnoughHeartsToPrestigeError(
        card.hearts,
        14700,
        reference
      );

    await UserCardService.removeHeartsFromCard(card, 14700);
    const newCard = await UserCardService.incrementCardStars(card);

    await msg.channel.send(
      `${this.config.discord.emoji.check.full} Prestiged **${newCard.abbreviation}#${newCard.serialNumber}**!\nIt now has **${newCard.stars}** :star:.`
    );
    await CardService.updateCardCache(newCard);
    return;
  }
}

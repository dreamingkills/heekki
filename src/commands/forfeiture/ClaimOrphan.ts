import { Message } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import * as error from "../../structures/Error";
import { PlayerService } from "../../database/service/PlayerService";

export class Command extends BaseCommand {
  names: string[] = ["claimforfeit", "cf"];
  disabled: boolean = true;
  async exec(msg: Message, executor: Profile) {
    const lastForfeit = executor.lastOrphan;
    const now = Date.now();
    if (now < lastForfeit + 1800000)
      throw new error.OrphanCooldownError(lastForfeit + 1800000, now);

    const reference = {
      identifier: this.options[0]?.split("#")[0],
      serial: parseInt(this.options[0]?.split("#")[1]),
    };
    if (isNaN(reference.serial)) throw new error.InvalidCardReferenceError();

    const targetCard = await CardService.getCardDataFromReference(reference);
    if (targetCard.ownerId !== "0")
      throw new error.CardNotOrphanedError(targetCard);

    await CardService.transferCardToProfile(executor, targetCard);
    await PlayerService.setLastOrphanClaim(executor, now);
    await msg.channel.send(
      `${this.bot.config.discord.emoji.check.full} You claimed **${targetCard.abbreviation}#${targetCard.serialNumber}**!\nYou will not be able to claim another card for **30 minutes**.`
    );
  }
}

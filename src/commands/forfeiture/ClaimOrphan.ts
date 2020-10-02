import { Message } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import {
  CardNotOrphanedError,
  OrphanCooldownError,
} from "../../structures/Error";
import { UserCardService } from "../../database/service/UserCardService";
import { PlayerService } from "../../database/service/PlayerService";

export class Command extends BaseCommand {
  names: string[] = ["claimforfeit", "cf"];
  async exec(msg: Message, executor: Profile) {
    const lastForfeit = await PlayerService.getLastOrphanClaim(executor);
    const now = Date.now();
    if (now < lastForfeit + 7200000)
      throw new OrphanCooldownError(lastForfeit + 7200000, now);

    const reference = {
      identifier: this.options[0]?.split("#")[0],
      serial: parseInt(this.options[0]?.split("#")[1]),
    };
    if (isNaN(reference.serial)) {
      msg.channel.send(
        `<:red_x:741454361007357993> Please enter a valid card reference.`
      );
      return;
    }

    const targetCard = await CardService.getCardDataFromReference(reference);
    if (targetCard.ownerId !== "0") throw new CardNotOrphanedError();

    await UserCardService.transferCardToProfile(executor, targetCard);
    await PlayerService.setLastOrphanClaim(executor, now);
    msg.channel.send(
      `:white_check_mark: You claimed **${targetCard.abbreviation}#${targetCard.serialNumber}**!\nYou will not be able to claim another card for **2 hours**.`
    );
  }
}

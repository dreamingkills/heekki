import { Message, MessageReaction, User } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { UserCardService } from "../../database/service/UserCardService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import * as error from "../../structures/Error";

export class Command extends BaseCommand {
  names: string[] = ["forfeit", "ff"];
  async exec(msg: Message, executor: Profile) {
    const reference = {
      identifier: this.options[0]?.split("#")[0],
      serial: parseInt(this.options[0]?.split("#")[1]),
    };
    if (isNaN(reference.serial)) throw new error.InvalidCardReferenceError();
    let card = await CardService.getCardDataFromReference(reference);

    if (card.ownerId !== msg.author.id)
      throw new error.NotYourCardError(reference);
    if (card.isFavorite) throw new error.CardFavoritedError(reference);

    let conf = await msg.channel.send(
      `:warning: Really forfeit **${card.abbreviation}#${card.serialNumber}**?\nThis action is **irreversible**. React to this message with :white_check_mark: to confirm.`
    );
    conf.react("✅");
    let filter = (reaction: MessageReaction, user: User) => {
      return reaction.emoji.name == "✅" && user.id == msg.author.id;
    };
    let reactions = await conf.awaitReactions(filter, {
      max: 1,
      time: 10000,
    });
    let rxn = reactions.first();

    if (rxn) {
      await UserCardService.forfeitCard(msg.author.id, card);

      conf.edit(
        `:white_check_mark: You forfeited **${card.abbreviation}#${card.serialNumber}**.`
      );
    } else {
      conf.edit(
        `<:red_x:741454361007357993> You did not react in time, so the forfeiture has been cancelled.`
      );
    }
    if (this.permissions.MANAGE_MESSAGES) conf.reactions.removeAll();
  }
}

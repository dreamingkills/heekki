import { Message, MessageReaction, User } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { UserCardService } from "../../database/service/UserCardService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import * as error from "../../structures/Error";
import { MarketService } from "../../database/service/MarketService";
import { UserCard } from "../../structures/player/UserCard";

export class Command extends BaseCommand {
  names: string[] = ["forfeit", "ff"];
  async exec(msg: Message, executor: Profile) {
    const references = this.options.filter((p) => p.includes("#"));
    const cardList = await Promise.all(
      references.map(async (p) => {
        return await CardService.getCardDataFromReference({
          identifier: p?.split("#")[0],
          serial: parseInt(p?.split("#")[1]),
        });
      })
    );
    if (cardList.length < 1) {
      msg.channel.send(
        "<:red_x:741454361007357993> You haven't specified any cards!"
      );
      return;
    }

    let validCards: UserCard[] = [];
    let invalidMessage = "";
    for (let c of cardList) {
      if (c.ownerId != msg.author.id) {
        invalidMessage += `\nYou are not the owner of **${c.abbreviation}#${c.serialNumber}**!`;
        continue;
      }
      if (c.isFavorite) {
        invalidMessage += `\nYour card **${c.abbreviation}#${c.serialNumber}** is currently favorited.`;
        continue;
      }
      if ((await MarketService.cardIsOnMarketplace(c)).forSale) {
        invalidMessage += `\nYour card **${c.abbreviation}#${c.serialNumber}** is currently on the marketplace.`;
        continue;
      }
      validCards.push(c!);
    }

    if (invalidMessage)
      await msg.channel.send(
        `<:red_x:741454361007357993> ${
          validCards.length === 0 ? "All" : "Some"
        } of the cards you specified were invalid:` + invalidMessage
      );
    if (validCards.length === 0) return;
    let conf = await msg.channel.send(
      `:warning: Really forfeit **${validCards.length}** cards?\nThis action is **irreversible**. React to this message with :white_check_mark: to confirm.`
    );
    await conf.react("✅");
    let filter = (reaction: MessageReaction, user: User) => {
      return reaction.emoji.name == "✅" && user.id == msg.author.id;
    };
    let reactions = await conf.awaitReactions(filter, {
      max: 1,
      time: 10000,
    });
    let rxn = reactions.first();

    if (rxn) {
      await UserCardService.transferCards("0", validCards);

      await conf.edit(
        `:white_check_mark: You forfeited **${validCards.length}** cards.`
      );
    } else {
      await conf.edit(
        `<:red_x:741454361007357993> You did not react in time, so the forfeiture has been cancelled.`
      );
    }
    if (this.permissions.MANAGE_MESSAGES) await conf.reactions.removeAll();
    return;
  }
}

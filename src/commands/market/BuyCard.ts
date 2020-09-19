import { Message, MessageReaction, User } from "discord.js";
import { MarketService } from "../../database/service/MarketService";
import { StatsService } from "../../database/service/StatsService";
import { CardService } from "../../database/service/CardService";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["buycard", "mpb"];
  usage: string[] = ["%c <card reference>"];
  desc: string = "Puts a card up for sale on the marketplace.";
  category: string = "market";

  async exec(msg: Message) {
    const reference = {
      abbreviation: this.options[0]?.split("#")[0],
      serial: parseInt(this.options[0]?.split("#")[1]),
    };
    const card = (await CardService.getCardDataFromReference(reference))
      .userCard;
    const forSale = await MarketService.cardIsOnMarketplace(card.userCardId);
    if (!forSale.forSale) {
      await msg.channel.send(
        `<:red_x:741454361007357993> **${card.abbreviation}#${card.serialNumber}** isn't listed on the Marketplace.`
      );
      return;
    }

    const conf = await msg.channel.send(
      `:warning: Are you sure you want to purchase **${card.abbreviation}#${card.serialNumber}** for ${forSale.price}?\nThis card has :star: **${card.stars}** and :heart: **${card.hearts}**. React with :white_check_mark: to confirm.`
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
      let buy = await MarketService.purchaseCard(msg.author.id, {
        abbreviation: this.options[0]?.split("#")[0],
        serial: parseInt(this.options[0]?.split("#")[1]),
      });

      StatsService.incrementStat("market_sales");

      if (buy.seller) {
        const seller = await msg.client.users.fetch(buy.seller.discord_id);
        if (seller)
          seller.send(
            `:white_check_mark: Your card **${buy.card.abbreviation}#${buy.card.serialNumber}** has been purchased by **${msg.author.tag}**.`
          );
      }

      conf.edit(
        `:white_check_mark: Successfully purchased **${buy.card.abbreviation}#${
          buy.card.serialNumber
        }**!\nYour new balance is <:coin:745447920072917093> **${
          buy.buyer.coins - buy.price
        }**.`
      );
    } else {
      conf.edit(
        `<:red_x:741454361007357993> You did not react in time, so the purchase has been cancelled.`
      );
    }
    conf.reactions.removeAll();
  }
}

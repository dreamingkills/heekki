import { Message, MessageReaction, User } from "discord.js";
import { MarketService } from "../../database/service/MarketService";
import { StatsService } from "../../database/service/StatsService";
import { CardService } from "../../database/service/CardService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import { PlayerService } from "../../database/service/PlayerService";
import { UserCardService } from "../../database/service/UserCardService";

export class Command extends BaseCommand {
  names: string[] = ["buycard", "mpb"];
  async exec(msg: Message, executor: Profile) {
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
    const card = await CardService.getCardDataFromReference(reference);
    const forSale = await MarketService.cardIsOnMarketplace(card);
    if (!forSale.forSale) {
      await msg.channel.send(
        `<:red_x:741454361007357993> **${card.abbreviation}#${card.serialNumber}** isn't listed on the Marketplace.`
      );
      return;
    }
    if (forSale.price > executor.coins) {
      msg.channel.send(
        `<:red_x:741454361007357993> You don't have enough coins to do that.\nListing Price: <:cash:757146832639098930> **${forSale.price}**\nYour Balance: <:cash:757146832639098930> **${executor.coins}**`
      );
      return;
    }

    const conf = await msg.channel.send(
      `:warning: Are you sure you want to purchase **${card.abbreviation}#${card.serialNumber}** for <:cash:757146832639098930> **${forSale.price}**?\nThis card has :star: **${card.stars}** and :heart: **${card.hearts}**. React with :white_check_mark: to confirm.`
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
      const sellerProfile = await PlayerService.getProfileByDiscordId(
        card.ownerId
      );
      await MarketService.removeListing(card);
      await UserCardService.transferCardToProfile(executor, card);
      await PlayerService.addCoinsToProfile(sellerProfile, forSale.price);
      await PlayerService.removeCoinsFromProfile(executor, forSale.price);

      StatsService.saleComplete(
        executor,
        card.ownerId,
        `${card.abbreviation}#${card.serialNumber}`
      );

      const seller = msg.client.users.resolve(card.ownerId);
      if (seller) {
        seller.send(
          `:white_check_mark: Your card **${card.abbreviation}#${card.serialNumber}** has been purchased by **${msg.author.tag}**.`
        );
      }

      conf.edit(
        `:white_check_mark: Successfully purchased **${card.abbreviation}#${
          card.serialNumber
        }**!\nYour new balance is <:cash:757146832639098930> **${
          executor.coins - forSale.price
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

import {
  EmbedField,
  Message,
  MessageEmbed,
  MessageReaction,
  TextChannel,
  User,
} from "discord.js";
import { CardService } from "../../database/service/CardService";
import { MarketService } from "../../database/service/MarketService";
import { PlayerService } from "../../database/service/PlayerService";
import { StatsService } from "../../database/service/StatsService";
import { UserCardService } from "../../database/service/UserCardService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import { UserCard } from "../../structures/player/UserCard";
import { Chance } from "chance";
import * as error from "../../structures/Error";

export class Command extends BaseCommand {
  names: string[] = ["market", "mp"];

  private async renderMarket(
    cards: { card: UserCard; price: number }[],
    page: number,
    limit: number,
    sender: User
  ): Promise<MessageEmbed> {
    const formatted: { name: string; value: string }[] = [];
    for (let listing of cards) {
      let seller;
      try {
        seller = (await sender.client.users.fetch(listing.card.ownerId))
          .username;
      } catch (e) {
        seller = "Unknown User";
      }

      formatted.push({
        name: `${listing.card.abbreviation}#${listing.card.serialNumber}`,
        value: `:star: ${listing.card.stars}\n<:cash:757146832639098930> ${listing.price}\nSeller: **${seller}**`,
      });
    }
    const embed = new MessageEmbed()
      .setAuthor(
        `The Marketplace | ${sender.tag} (page ${page}/${limit})`,
        sender.displayAvatarURL()
      )
      .setDescription(
        cards.length === 0
          ? ":mag_right: There's nothing here... Try searching for something else!"
          : ""
      )
      .addFields(formatted)
      .setFooter(
        `To buy a card, use !mp buy <card reference>.\nTo change pages, click the arrow reactions.`
      )
      .setColor(`#FFAACC`);
    return embed;
  }

  async exec(msg: Message, executor: Profile) {
    const subcommand = this.options[0];
    const optionsRaw = this.options.filter((v) => v.includes("="));
    let options: { [key: string]: string } = {};
    for (let option of optionsRaw) {
      const name = option.split("=")[0];
      const value = option.split("=")[1];
      options[name.toLowerCase()] = value;
    }

    switch (subcommand) {
      case "sell": {
        const reference = {
          identifier: this.options[1]?.split("#")[0],
          serial: parseInt(this.options[1]?.split("#")[1]),
        };
        if (isNaN(reference.serial))
          throw new error.InvalidCardReferenceError();

        const card = await CardService.getCardDataFromReference(reference);
        if (card.ownerId !== msg.author.id)
          throw new error.NotYourCardError(reference);
        if (card.isFavorite) throw new error.CardFavoritedError(reference);

        const isForSale = await MarketService.cardIsOnMarketplace(card);
        if (isForSale.forSale) throw new error.CardOnMarketplaceError();

        let price = parseFloat(this.options[2]);
        if (this.options[2]?.toLowerCase().endsWith("k")) price = price * 1000;
        price = Math.round(price);
        if (isNaN(price)) {
          await msg.channel.send(
            "<:red_x:741454361007357993> Please specify a price."
          );
          return;
        }

        await MarketService.sellCard(price, card);

        await msg.channel.send(
          `:white_check_mark: You've listed **${card.abbreviation}#${
            card.serialNumber
          }** on the Marketplace for <:cash:757146832639098930> **${price.toLocaleString()}**.`
        );
        break;
      }
      case "unsell": {
        const reference = {
          identifier: this.options[1]?.split("#")[0],
          serial: parseInt(this.options[1]?.split("#")[1]),
        };
        if (isNaN(reference.serial))
          throw new error.InvalidCardReferenceError();

        const card = await CardService.getCardDataFromReference(reference);
        if (card.ownerId !== msg.author.id)
          throw new error.NotYourCardError(reference);

        const isOnMarketplace = await MarketService.cardIsOnMarketplace(card);
        if (!isOnMarketplace.forSale)
          throw new error.CardNotForSaleError(reference);

        await MarketService.removeListing(card);
        await msg.channel.send(
          `:white_check_mark: You've removed the listing for **${card.abbreviation}#${card.serialNumber}** from the Marketplace.`
        );
        break;
      }
      case "buy": {
        const reference = {
          identifier: this.options[1]?.split("#")[0],
          serial: parseInt(this.options[1]?.split("#")[1]),
        };
        if (isNaN(reference.serial))
          throw new error.InvalidCardReferenceError();
        const card = await CardService.getCardDataFromReference(reference);

        const forSale = await MarketService.cardIsOnMarketplace(card);
        if (!forSale.forSale) throw new error.CardNotForSaleError(reference);
        if (forSale.price > executor.coins)
          throw new error.NotEnoughCoinsError(executor.coins, forSale.price);

        const conf = await msg.channel.send(
          `:warning: Are you sure you want to purchase **${card.abbreviation}#${card.serialNumber}** for <:cash:757146832639098930> **${forSale.price}**?\nThis card has :star: **${card.stars}** and :heart: **${card.hearts}**. React with :white_check_mark: to confirm.`
        );
        await conf.react("✅");

        let filter = (reaction: MessageReaction, user: User) => {
          return reaction.emoji.name == "✅" && user.id == msg.author.id;
        };
        let reactions = conf.createReactionCollector(filter, {
          max: 1,
          time: 10000,
        });

        reactions.on("collect", async () => {
          const verification = await CardService.getCardDataFromReference(
            reference
          );
          if (verification.ownerId !== card.ownerId) {
            await msg.channel.send(
              `<:red_x:741454361007357993> That card has already been sold to someone else.`
            );
            return;
          }
          const sellerProfile = await PlayerService.getProfileByDiscordId(
            card.ownerId
          );
          await MarketService.removeListing(card);
          await UserCardService.transferCardToProfile(executor, card);
          await PlayerService.addCoinsToProfile(sellerProfile, forSale.price);
          await PlayerService.removeCoinsFromProfile(executor, forSale.price);

          const chance = new Chance();
          //const xp = chance.integer({ min: 40, max: 71 });
          //PlayerService.addXp(sellerProfile, xp);

          await StatsService.saleComplete(
            executor,
            card.ownerId,
            `${card.abbreviation}#${card.serialNumber}`,
            forSale.price
          );

          const seller = msg.client.users.resolve(card.ownerId);
          if (seller) {
            await seller.send(
              `:white_check_mark: Your card **${card.abbreviation}#${card.serialNumber}** has been purchased by **${msg.author.tag}**` //\n+ **${xp}** XP`
            );
          }

          await conf.edit(
            `:white_check_mark: Successfully purchased **${card.abbreviation}#${
              card.serialNumber
            }**!\nYour new balance is <:cash:757146832639098930> **${
              executor.coins - forSale.price
            }**.`
          );
          return;
        });
        reactions.on("end", async (collected, reason) => {
          if (reason !== "time") return;
          await conf.edit(
            `<:red_x:741454361007357993> You did not react in time, so the purchase has been cancelled.`
          );
          if (this.permissions.MANAGE_MESSAGES)
            await conf.reactions.removeAll();
        });
        break;
      }
      default: {
        if (msg.mentions.users.first()) {
          options.owner = msg.mentions.users.first()!.id;
        }
        const totalOnMarket = await MarketService.getMarketCount({
          ...options,
        });
        const pageLimit = Math.ceil(totalOnMarket / 15);
        const pageRaw = isNaN(parseInt(options.page))
          ? 1
          : parseInt(options.page);
        let page = pageRaw > pageLimit ? pageLimit : pageRaw;

        const ff = await MarketService.getMarket({ ...options, page });
        const sent = await msg.channel.send(
          await this.renderMarket(ff, page, pageLimit, msg.author)
        );

        if (pageLimit > 2) await sent.react(`⏪`);
        if (pageLimit > 1) await sent.react(`◀️`);
        if (this.permissions.MANAGE_MESSAGES)
          await sent.react(`754832389620105276`);
        if (pageLimit > 1) await sent.react(`▶️`);
        if (pageLimit > 2) await sent.react(`⏩`);

        let filter;
        if (pageLimit > 1) {
          filter = (r: MessageReaction, u: User) =>
            (r.emoji.name === "⏪" ||
              r.emoji.name === "◀️" ||
              r.emoji.name === "delete" ||
              r.emoji.name === "▶️" ||
              r.emoji.name === "⏩") &&
            msg.author.id === u.id;
        } else
          filter = (r: MessageReaction, u: User) =>
            r.emoji.name === "delete" && msg.author.id === u.id;

        const collector = sent.createReactionCollector(filter, { time: 60000 });
        collector.on("collect", async (r) => {
          let newPage = 0;
          if (r.emoji.name === "⏪" && page !== 1) newPage = 1;
          if (r.emoji.name === "◀️" && page !== 1) newPage = page - 1;
          if (r.emoji.name === "▶️" && page !== pageLimit) newPage = page + 1;
          if (r.emoji.name === "⏩" && page !== pageLimit) newPage = pageLimit;
          if (r.emoji.name === "delete" && this.permissions.MANAGE_MESSAGES) {
            (<TextChannel>msg.channel).bulkDelete([msg, sent]);
            return;
          }

          if (this.permissions.MANAGE_MESSAGES) r.users.remove(msg.author);

          if (newPage !== 0 && newPage !== page) {
            const newCards = await MarketService.getMarket({
              ...options,
              limit: 15,
              page: newPage,
            });
            await sent.edit(
              await this.renderMarket(newCards, newPage, pageLimit, msg.author)
            );
            page = newPage;
          }
        });

        collector.on("end", async () => {
          if (
            !sent.deleted &&
            msg.guild
              ?.member(msg.client.user!)
              ?.hasPermission("MANAGE_MESSAGES")
          )
            await sent.reactions.removeAll();
        });
        return;
      }
    }
  }
}

import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { MarketService } from "../../database/service/MarketService";
import { PlayerService } from "../../database/service/PlayerService";
import { StatsService } from "../../database/service/StatsService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import { UserCard } from "../../structures/player/UserCard";
import * as error from "../../structures/Error";

export class Command extends BaseCommand {
  names: string[] = ["market", "mp"];

  private async renderMarket(
    cards: { card: UserCard; price: number }[],
    page: number,
    limit: number,
    sender: User
  ): Promise<MessageEmbed> {
    const formatted: { name: string; value: string; inline: boolean }[] = [];
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
        value: `:star: ${listing.card.stars}\n${this.config.discord.emoji.cash.full} ${listing.price}\nSeller: **${seller}**`,
        inline: true,
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
          throw new error.NotYourCardError(card);
        if (card.isFavorite) throw new error.CardFavoritedError(card);
        const eden = await PlayerService.getEden(executor);
        if (CardService.cardInEden(card, eden))
          throw new error.CardInEdenError(card);

        const isForSale = await MarketService.cardIsOnMarketplace(card);
        if (isForSale.forSale) throw new error.CardOnMarketplaceError(card);

        let price = parseFloat(this.options[2]);
        if (this.options[2]?.toLowerCase().endsWith("k")) price = price * 1000;
        price = Math.round(price);
        if (isNaN(price)) {
          await msg.channel.send(
            `${this.config.discord.emoji.cross.full} Please specify a price.`
          );
          return;
        }

        await MarketService.sellCard(price, card);

        await msg.channel.send(
          `${this.config.discord.emoji.check.full} You've listed **${
            card.abbreviation
          }#${card.serialNumber}** on the Marketplace for ${
            this.config.discord.emoji.cash.full
          } **${price.toLocaleString()}**.`
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
          throw new error.NotYourCardError(card);

        const isOnMarketplace = await MarketService.cardIsOnMarketplace(card);
        if (!isOnMarketplace.forSale) throw new error.CardNotForSaleError(card);

        await MarketService.removeListing(card);
        await msg.channel.send(
          `${this.config.discord.emoji.check.full} You've removed the listing for **${card.abbreviation}#${card.serialNumber}** from the Marketplace.`
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
        if (!forSale.forSale) throw new error.CardNotForSaleError(card);
        if (forSale.price > executor.coins)
          throw new error.NotEnoughCoinsError();

        const conf = await msg.channel.send(
          `:warning: Are you sure you want to purchase **${card.abbreviation}#${card.serialNumber}** for ${this.config.discord.emoji.cash.full} **${forSale.price}**?\nThis card has :star: **${card.stars}** and ${this.config.discord.emoji.hearts.full} **${card.hearts}**. React with ${this.config.discord.emoji.check.full} to confirm.`
        );
        await conf.react(this.config.discord.emoji.check.id);

        let filter = (reaction: MessageReaction, user: User) => {
          return (
            reaction.emoji.id === this.config.discord.emoji.check.id &&
            user.id == msg.author.id
          );
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
              `${this.config.discord.emoji.cross.full} That card has already been sold to someone else.`
            );
            return;
          }
          const sellerProfile = await PlayerService.getProfileByDiscordId(
            card.ownerId
          );
          await MarketService.removeListing(card);
          await CardService.transferCardToProfile(executor, card);
          await PlayerService.addCoinsToProfile(sellerProfile, forSale.price);
          await PlayerService.removeCoinsFromProfile(executor, forSale.price);

          await StatsService.saleComplete(
            executor,
            card.ownerId,
            `${card.abbreviation}#${card.serialNumber}`,
            forSale.price
          );

          const seller = msg.client.users.resolve(card.ownerId);
          if (seller) {
            await seller.send(
              `${this.config.discord.emoji.check.full} Your card **${card.abbreviation}#${card.serialNumber}** has been purchased by **${msg.author.tag}**` //\n+ **${xp}** XP`
            );
          }

          await conf.edit(
            `${this.config.discord.emoji.check.full} Successfully purchased **${
              card.abbreviation
            }#${card.serialNumber}**!\nYour new balance is ${
              this.config.discord.emoji.cash.full
            } **${executor.coins - forSale.price}**.`
          );
          return;
        });
        reactions.on("end", async (_, reason) => {
          if (reason !== "time") return;
          await conf.edit(
            `${this.config.discord.emoji.cross.full} You did not react in time, so the purchase has been cancelled.`
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
        await sent.react(this.config.discord.emoji.delete.id);
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
          if (r.emoji.name === "⏪" && page !== 1) page = 1;
          if (r.emoji.name === "◀️" && page !== 1) page--;
          if (r.emoji.name === "▶️" && page !== pageLimit) page++;
          if (r.emoji.name === "⏩" && page !== pageLimit) page = pageLimit;
          if (r.emoji.name === "delete") return await sent.delete();

          const newCards = await MarketService.getMarket({
            ...options,
            limit: 15,
            page: page,
          });
          await sent.edit(
            await this.renderMarket(newCards, page, pageLimit, msg.author)
          );
          if (this.permissions.MANAGE_MESSAGES)
            await r.users.remove(msg.author);
        });

        collector.on("end", async () => {
          if (!sent.deleted && this.permissions.MANAGE_MESSAGES)
            await sent.reactions.removeAll();
        });
        return;
      }
    }
  }
}

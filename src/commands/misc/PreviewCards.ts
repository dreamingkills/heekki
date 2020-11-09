import {
  Message,
  MessageEmbed,
  MessageReaction,
  User,
  TextChannel,
} from "discord.js";
import { CardService } from "../../database/service/CardService";
import { MarketService } from "../../database/service/MarketService";
import { ShopService } from "../../database/service/ShopService";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["preview", "pre"];
  async exec(msg: Message) {
    const referencesRaw = this.options
      .filter((p) => p.includes("#"))
      .slice(0, 9);
    const cards = [];
    for (let ref of referencesRaw) {
      const reference = {
        identifier: ref.split("#")[0],
        serial: parseInt(ref.split("#")[1]),
      };
      if (!reference.identifier || isNaN(reference.serial)) continue;
      const card = await CardService.getCardDataFromReference(reference);
      cards.push(card);
    }

    if (cards.length === 0) {
      await msg.channel.send(
        `${this.config.discord.emoji.cross.full} You didn't enter any valid cards.`
      );
      return;
    }
    const embed = new MessageEmbed()
      .setAuthor(
        `Card Previews | ${msg.author.tag}`,
        msg.author.displayAvatarURL()
      )
      .setDescription(`**${cards.length}** cards requested...`)
      .setColor(`#FFAACC`);
    for (let card of cards) {
      const isInMarketplace = await MarketService.cardIsOnMarketplace(card);
      const pack = await ShopService.getPackById(card.packId);
      let owner;
      try {
        if (card.ownerId === "0") {
          owner = "No-one!";
        } else owner = (await msg.client.users.fetch(card.ownerId)).username;
      } catch (e) {
        owner = "Unknown User";
      }
      embed.addField(
        `${card.abbreviation}#${card.serialNumber}`,
        `Owner: **${owner}**\n**${pack.title}**\n${card.member}\n:star: **${
          card.stars
        }**\n${
          this.config.discord.emoji.hearts.full
        } **${card.hearts.toLocaleString()}**\n${
          isInMarketplace.forSale
            ? `${
                this.config.discord.emoji.cash.full
              } For Sale: **${isInMarketplace.price.toLocaleString()}**`
            : ""
        }`,
        true
      );
    }

    const sent = await msg.channel.send(embed);
    if (this.permissions.MANAGE_MESSAGES) {
      await sent.react(`753019858932727868`);
      const collector = sent.createReactionCollector(
        (reaction: MessageReaction, user: User) =>
          reaction.emoji.id === "753019858932727868" &&
          user.id === msg.author.id
      );
      collector.on("collect", (_) =>
        (<TextChannel>msg.channel).bulkDelete([sent, msg])
      );
    }
  }
}

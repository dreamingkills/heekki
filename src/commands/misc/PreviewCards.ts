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
  names: string[] = ["preview"];
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
        `<:red_x:741454361007357993> You didn't enter any valid cards.`
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
      const owner = await msg.client.users.fetch(card.ownerId);
      embed.addField(
        `${card.abbreviation}#${card.serialNumber}`,
        `Owner: **${owner?.tag || "Unknown User"}**\n**${pack.title}**\n${
          card.member
        }\n:star: **${
          card.stars
        }**\n<:heekki_heart:757147742383505488> **${card.hearts.toLocaleString()}**\n${
          isInMarketplace.forSale
            ? `<:cash:757146832639098930> For Sale: **${isInMarketplace.price.toLocaleString()}**`
            : ""
        }`,
        true
      );
    }

    const sent = await msg.channel.send(embed);
    if (this.permissions.MANAGE_MESSAGES) {
      sent.react(`753019858932727868`);
      const collector = sent.createReactionCollector(
        (reaction: MessageReaction, user: User) =>
          reaction.emoji.id === "753019858932727868" &&
          user.id === msg.author.id
      );
      collector.on("collect", (r) =>
        (<TextChannel>msg.channel).bulkDelete([sent, msg])
      );
    }
  }
}

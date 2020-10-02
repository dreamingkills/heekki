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
    const references = this.options.filter((p) => p.includes("#")).slice(0, 9);
    const cardList = await Promise.all(
      references.map(async (p) => {
        return await CardService.getCardDataFromReference({
          identifier: p.split("#")[0],
          serial: parseInt(p.split("#")[1]),
        });
      })
    );

    const embed = new MessageEmbed()
      .setAuthor(
        `Card Previews | ${msg.author.tag}`,
        msg.author.displayAvatarURL()
      )
      .setDescription(`**${cardList.length}** cards requested...`)
      .setColor(`#FFAACC`);
    for (let card of cardList) {
      const isInMarketplace = await MarketService.cardIsOnMarketplace(card);
      const pack = await ShopService.getPackById(card.packId);
      embed.addField(
        `${card.abbreviation}#${card.serialNumber}`,
        `Owner: <@${card.ownerId}>\n**${pack.title}**\n${
          card.member
        }\n:star: **${card.stars}**\n<:heekki_heart:757147742383505488> **${
          card.hearts
        }**\n\n${
          isInMarketplace.forSale
            ? `:dollar: For Sale: **${isInMarketplace.price}** <:cash:757146832639098930>`
            : ""
        }`,
        true
      );
    }

    const sent = await msg.channel.send(embed);
    if (msg.guild?.member(msg.client.user!)?.hasPermission("MANAGE_MESSAGES")) {
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

import { GameCommand } from "../../structures/command/GameCommand";
import {
  Message,
  MessageEmbed,
  MessageReaction,
  User,
  TextChannel,
} from "discord.js";
import { CardService } from "../../database/service/CardService";
import { MarketService } from "../../database/service/MarketService";

export class Command extends GameCommand {
  names: string[] = ["preview"];
  usage: string[] = ["%c <up to 9 card references...>"];
  desc: string = "Preview up to 9 cards.";
  category: string = "player";

  exec = async (msg: Message) => {
    const references = this.prm.filter((p) => p.includes("#")).slice(0, 9);
    const cardList = await Promise.all(
      references.map(async (p) => {
        return (
          await CardService.getCardDataFromReference({
            abbreviation: p.split("#")[0],
            serial: parseInt(p.split("#")[1]),
          })
        ).userCard;
      })
    );

    const embed = new MessageEmbed()
      .setAuthor(
        `Card Previews | ${msg.author.tag}`,
        msg.author.displayAvatarURL()
      )
      .setDescription(`**${cardList.length}** cards requested...`)
      .setColor(`#40BD66`);
    for (let card of cardList) {
      const isInMarketplace = await MarketService.cardIsOnMarketplace(
        card.userCardId
      );
      embed.addField(
        `${card.abbreviation}#${card.serialNumber}`,
        `**${card.title}**\n${card.member}\n:star: **${
          card.stars
        }**\n:heart: **${card.hearts}**\nOwner: <@${card.ownerId}>${
          isInMarketplace.forSale
            ? `\n:dollar: For Sale: **${isInMarketplace.price}** <:coin:745447920072917093>`
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
  };
}

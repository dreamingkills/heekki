import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { CardService } from "../../database/service/CardService";
import { MarketService } from "../../database/service/MarketService";

export class Command extends GameCommand {
  names: string[] = ["inventory", "inv"];
  usage: string[] = ["%c [page]"];
  desc: string = "Shows a user's inventory.";
  category: string = "player";

  exec = async (msg: Message) => {
    const optionsRaw = this.prm.filter((v) => v.includes("="));
    let options: { [key: string]: string } = {};
    for (let option of optionsRaw) {
      const name = option.split("=")[0];
      const value = option.split("=")[1];
      options[name.toLowerCase()] = value;
    }

    const user = msg.mentions.users.first() || msg.author;
    const profile = await PlayerService.getProfileByDiscordId(user.id, true);
    const cards = await PlayerService.getCardsByDiscordId(profile.discord_id, {
      ...options,
      limit: 10,
    });
    const cardCount = await PlayerService.getCardCountByDiscordId(
      profile.discord_id,
      options
    );

    let desc = `${user.tag} has **${cardCount}** card(s)${
      optionsRaw.length > 0 ? " matching this search" : ""
    }!\n${optionsRaw.length > 0 ? "```" : ""}${optionsRaw.join("\n")}${
      optionsRaw.length > 0 ? "```\n" : ""
    }\n`;

    for (let card of cards) {
      const isOnMarketplace = await MarketService.cardIsOnMarketplace(
        card.userCardId
      );
      let lvl = CardService.heartsToLevel(card.hearts).level;
      desc += `__**${card.abbreviation}#${card.serialNumber}**__ - ${
        card.member
      } ${card.isFavorite ? ":heart:" : ""}${
        isOnMarketplace.forSale ? ":dollar:" : ""
      }\nLevel **${lvl}** / ${":star:".repeat(card.stars)}\n`;
    }
    const embed = new MessageEmbed()
      .setAuthor(
        `Inventory | ${user.tag} (page ${
          isNaN(parseInt(options.page)) ? 1 : options.page
        }/${Math.ceil(cardCount / 10)})`,
        msg.author.displayAvatarURL()
      )
      .setDescription(desc)
      .setThumbnail(user.displayAvatarURL())
      .setColor("#40BD66")
      .setFooter("To browse another page, use !inventory <page number>");
    msg.channel.send(embed);
  };
}

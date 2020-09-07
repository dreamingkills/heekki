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
    const page = !isNaN(parseInt(this.prm[0])) ? parseInt(this.prm[0]) : 1;
    const user = await PlayerService.getProfileByDiscordId(msg.author.id, true);
    const cards = await PlayerService.getCardsByUser(user.discord_id, {
      limit: 10,
      page: page,
    });
    const cardCount = await PlayerService.getCardCountByUserId(user.discord_id);

    let desc = `${msg.author.tag} has **${cardCount}** cards!\n\n`;

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
        `Inventory | ${msg.author.tag} (page ${page}/${Math.ceil(
          cardCount / 10
        )})`
      )
      .setDescription(desc)
      .setThumbnail(msg.author.displayAvatarURL())
      .setColor("#40BD66")
      .setFooter("To browse another page, use !inventory <page number>");
    msg.channel.send(embed);
  };
}

import { Cipher } from "crypto";
import { Message, MessageAttachment, MessageEmbed } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { PlayerService } from "../../database/service/PlayerService";
import { ShopService } from "../../database/service/ShopService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["pack", "viewpack", "vp"];
  exec = async (msg: Message, executor: Profile) => {
    if (!this.options[0]) {
      msg.channel.send(
        "<:red_x:741454361007357993> Please specify a pack to view."
      );
    }
    const packName = this.options.join(" ");
    const pack = await ShopService.getPackByFuzzySearch(packName);
    const packCards = await CardService.getCardsByPack(pack);
    const ownedByUser = await PlayerService.getCardsByProfile(executor, {
      pack: pack.keyword,
    });

    const count = ownedByUser.filter((c) => c.id === 1).length;
    console.log(count);

    const embed = new MessageEmbed()
      .setAuthor(`Pack Viewer | ${msg.author.tag}`)
      .setDescription(
        `*"${pack.flavorText}"*\n<:cards:757151797235286089> There ${
          packCards.length > 1 ? "are" : "is"
        } **${packCards.length}** card${
          packCards.length > 1 ? "s" : ""
        } in the **${pack.title}** pack.\nYou own **${
          ownedByUser.length
        }** card${
          ownedByUser.length > 1 ? "s" : ""
        } from this pack.\n\n${packCards.map((card) => {
          const count = ownedByUser.filter((c) => c.id === card.id).length;
          return `${
            count > 0
              ? `<:cards:757151797235286089>`
              : `<:cards_dark:757771501335347311>`
          } **${card.member}** (${card.abbreviation})\nOwned: **${count}**\n*"${
            card.blurb
          }"*\n`;
        })}`
      )
      .setColor(`#FFAACC`)
      .setFooter(`Pack designed by ${pack.credit}`);
    await msg.channel.send(embed);
  };
}

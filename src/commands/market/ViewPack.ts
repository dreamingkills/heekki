import { Cipher } from "crypto";
import { Message, MessageAttachment, MessageEmbed } from "discord.js";
import { OutputFileType } from "typescript";
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
      return;
    }
    const packName = this.options.join(" ");
    const pack = await ShopService.getPackByFuzzySearch(packName);
    const packCards = await CardService.getCardsByPack(pack);
    const ownedByUser = await PlayerService.getCardsByProfile(executor, {
      pack: pack.title,
    });

    const length = packCards.length;
    let size,
      i = 0,
      out = [],
      n = 3;

    if (length % 3 === 0) {
      size = Math.floor(length / 3);
      while (i < length) {
        out.push(packCards.slice(i, (i += size)));
      }
    } else {
      while (i < length) {
        size = Math.ceil((length - i) / n--);
        out.push(packCards.slice(i, (i += size)));
      }
    }

    const embed = new MessageEmbed().setAuthor(
      `Pack Viewer | ${msg.author.tag}`,
      msg.author.displayAvatarURL()
    );
    if (out[0])
      embed.addField(
        `Cards (1)`,
        out[0].map((c) => {
          return `<:cards:757151797235286089> **${c.member}** (${
            c.abbreviation
          })\nOwned: **${
            ownedByUser.filter((card) => card.id === c.id).length
          }**${c.blurb ? `\n*"${c.blurb}"*` : ``}`;
        }),
        true
      );
    if (out[1])
      embed.addField(
        `Cards (2)`,
        out[1].map((c) => {
          return `<:cards:757151797235286089> **${c.member}** (${
            c.abbreviation
          })\nOwned: **${
            ownedByUser.filter((card) => card.id === c.id).length
          }**${c.blurb ? `\n*"${c.blurb}"*` : ``}`;
        }),
        true
      );
    if (out[2])
      embed.addField(
        `Cards (3)`,
        out[2].map((c) => {
          return `<:cards:757151797235286089> **${c.member}** (${
            c.abbreviation
          })\nOwned: **${
            ownedByUser.filter((card) => card.id === c.id).length
          }**${c.blurb ? `\n*"${c.blurb}"*` : ``}`;
        }),
        true
      );

    embed.setDescription(
      `${
        pack.flavorText ? `*"${pack.flavorText}"*` : ``
      }\n<:cards:757151797235286089> There ${
        packCards.length > 1 ? "are" : "is"
      } **${packCards.length}** card${
        packCards.length > 1 ? "s" : ""
      } in the **${pack.title}** pack.\nYou own **${ownedByUser.length}** card${
        ownedByUser.length > 1 ? "s" : ""
      } from this pack.`
    );
    embed
      .setColor(`#FFAACC`)
      .setFooter(`Pack designed by ${pack.credit}`)
      .setThumbnail(`attachment://cover.png`);

    await msg.channel.send({
      embed,
      files: [{ attachment: pack.cover, name: "cover.png" }],
    });
  };
}

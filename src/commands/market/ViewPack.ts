import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { MarketService } from "../../database/service/MarketService";
import { ShopService } from "../../database/service/ShopService";

export class Command extends GameCommand {
  names: string[] = ["viewpack", "vp"];
  usage: string[] = ["%c <pack name>"];
  desc: string = "Shows a list of cards in a pack.";
  category: string = "market";

  exec = async (msg: Message) => {
    const packName = this.prm.join("");
    const pack = await ShopService.getFullPackData(packName);
    const cardsPerColumn = Math.ceil(pack.cards.length / 3);

    const cardList1 = pack.cards.slice(0, cardsPerColumn).map((c) => {
      return `**${c.member}** (${c.abbreviation})\n${
        c.blurb !== "" ? `*${c.blurb}*` : ""
      }\n`;
    });
    const cardList2 = pack.cards
      .slice(cardsPerColumn, cardsPerColumn * 2)
      .map((c) => {
        return `**${c.member}** (${c.abbreviation})\n${
          c.blurb !== "" ? `*${c.blurb}*` : ""
        }\n`;
      });
    const cardList3 = pack.cards
      .slice(cardsPerColumn * 2, cardsPerColumn * 3)
      .map((c) => {
        return `**${c.member}** (${c.abbreviation})\n${
          c.blurb !== "" ? `*${c.blurb}*` : ""
        }\n`;
      });

    const embed = new MessageEmbed()
      .setDescription(pack.flavor)
      .setAuthor(`Pack | ${pack.name}`)
      .setImage(pack.cover)
      .setFooter(`Created by ${pack.credit}`)
      .setColor("#40BD66")
      .addField(`Card listing (1)`, cardList1, true)
      .addField(`Card listing (2)`, cardList2, true)
      .addField(`Card listing (3)`, cardList3, true);

    msg.channel.send(embed);
  };
}

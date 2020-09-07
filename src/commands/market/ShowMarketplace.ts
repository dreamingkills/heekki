import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { MarketService } from "../../database/service/MarketService";

export class Command extends GameCommand {
  names: string[] = ["market", "marketplace", "mp"];
  usage: string[] = ["%c [page]"];
  desc: string = "Shows a list of cards currently up for sale.";
  category: string = "market";

  exec = async (msg: Message) => {
    let options: { page?: number; priceMin?: number; priceMax?: number } = {};
    this.prm.forEach((o) => {
      if (o.startsWith("page=")) {
        options.page = parseInt(o.split("=")[1]);
      }
      if (o.startsWith("price<")) {
        options.priceMax = parseInt(o.split("<")[1]);
      } else if (o.startsWith("price>")) {
        options.priceMin = parseInt(o.split(">")[1]);
      }
    });

    let ff = await MarketService.getMarket(options);

    let embed = new MessageEmbed()
      .setAuthor(`The Marketplace - page ${options.page || 1}`)
      .setDescription(
        ff.length === 0
          ? ":mag_right: There's nothing here... Try searching for a different page!"
          : ""
      )
      .addFields(
        ff.map((c) => {
          return {
            name: `${c.card.abbreviation}#${c.card.serialNumber}`,
            value: `**${c.card.title}**\n${c.card.member}\n:star: ${c.card.stars}\n<:coin:745447920072917093> ${c.price}`,
            inline: true,
          };
        })
      )
      .setFooter(`Use !market page=X to view another page.`)
      .setColor(`#40BD66`);
    msg.channel.send(embed);
  };
}

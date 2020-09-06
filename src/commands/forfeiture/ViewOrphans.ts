import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";

export class Command extends GameCommand {
  names: string[] = ["viewforfeited", "vff"];
  usage: string[] = ["%c [page]"];
  desc: string = "Shows a list of forfeited cards.";
  category: string = "card";

  exec = async (msg: Message) => {
    let page = isNaN(parseInt(this.prm[0])) ? 1 : parseInt(this.prm[0]);
    let forfeitedRaw = await PlayerService.getOrphanedCards(page);

    let embed = new MessageEmbed()
      .setAuthor(`Cards currently up-for-grabs`)
      .setFooter(
        `Use !cf <card reference> to claim a card / !vff [page] to view another page`
      )
      .setColor("#40BD66");

    for (let f of forfeitedRaw) {
      embed.addField(
        `${f.abbreviation}#${f.serialNumber}`,
        `:star: ${f.stars}\n:heart: ${f.hearts}`,
        true
      );
    }

    await msg.channel.send(embed);
    return;
  };
}

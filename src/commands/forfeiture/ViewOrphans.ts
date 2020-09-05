import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";

export class Command extends GameCommand {
  names: string[] = ["viewforfeited", "vff"];
  usage: string[] = ["%c [page]"];
  desc: string = "Shows a list of forfeited cards.";
  category: string = "card";

  exec = async (msg: Message) => {
    let forfeitedRaw = await PlayerService.getOrphanedCards();
    let page = this.prm[0] ? parseInt(this.prm[0]) : 1;

    let forfeited = forfeitedRaw.slice(page * 9 - 9, page * 9);

    let embed = new MessageEmbed()
      .setAuthor(`Cards currently up-for-grabs`)
      .setFooter(
        `Use !cf <card reference> to claim a card / !vff [page] to view another page`
      )
      .setColor("#40BD66");

    for (let f of forfeited) {
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

import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/Player";
import { CardService } from "../../database/Card";

export class Command extends GameCommand {
  names: string[] = ["inventory", "inv"];
  usage: string[] = ["%c [page]"];
  desc: string = "Shows a user's inventory.";
  category: string = "player";

  exec = async (msg: Message) => {
    let id = msg.author.id;
    let page = this.prm[0] ? parseInt(this.prm[0]) : 1;
    let user = await PlayerService.getProfileFromUser(id, true);
    let cardsRaw = await PlayerService.getCardsByUser(user.discord_id);

    let member = msg.guild?.member(id);
    let desc = `${member?.user.tag} has **${cardsRaw.length}** cards!\n\n`;

    let cards = cardsRaw.slice(page * 10 - 10, page * 10);
    for (let card of cards) {
      let lvl = CardService.heartsToLevel(card.hearts).level;
      desc += `__**${card.abbreviation}#${card.serialNumber}**__ - ${
        card.member
      }\nLevel **${lvl}** / ${":star:".repeat(card.stars)}\n`;
    }
    let embed = new MessageEmbed()
      .setAuthor(
        `${msg.author.tag}'s inventory (page ${page}/${Math.ceil(
          cardsRaw.length / 10
        )})`
      )
      .setDescription(desc)
      .setThumbnail(msg.author.displayAvatarURL())
      .setColor("#40BD66")
      .setFooter("To browse another page, use !inventory <page number>");
    await msg.channel.send(embed);
  };
}

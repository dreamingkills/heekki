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
    let cardsData = await PlayerService.getCardsByUser(
      user!.discord_id,
      true,
      page
    );
    let cards = cardsData.cards;

    let member = msg.guild?.member(id);
    let desc = `${member?.user.tag} has **${cardsData.total}** cards!\n\n`;

    for (let card of cards) {
      let lvl = CardService.heartsToLevel(card.hearts).level;
      desc += `__**${card.card.collection.name}#${card.serialNumber}**__ - ${
        card.card.member
      }\nLevel **${lvl}** / ${":star:".repeat(card.stars)}\n`;
    }
    let embed = new MessageEmbed()
      .setAuthor(`${msg.author.tag}'s inventory (page ${page})`)
      .setDescription(desc)
      .setThumbnail(msg.author.displayAvatarURL())
      .setColor("#40BD66")
      .setFooter("To browse another page, use !inventory <page number>");
    await msg.channel.send(embed);
  };
}

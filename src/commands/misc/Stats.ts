import { Message, MessageEmbed } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";
import { Stats } from "../../database/sql/stats/Fetch";

export class Command extends BaseCommand {
  names: string[] = ["stats"];
  usage: string[] = ["%c"];
  desc: string = "Posts various stats collected from the bot.";
  category: string = "misc";

  exec = async function (msg: Message) {
    let cardsTotal = await Stats.getNumberOfCards();
    let cardsTotal6Stars = await Stats.getNumberOfCards(6);
    let cardsTotal5Stars = await Stats.getNumberOfCards(5);
    let profileTotal = await Stats.getNumberOfProfiles();
    let richestUser = await Stats.findRichestUser();
    let relationships = await Stats.getNumberOfRelationships();
    let topCollector = await Stats.getTopCollector();

    let embed = new MessageEmbed()
      .setAuthor(`HaSeul Statistics`)
      .addField(
        `Card stats`,
        `Total cards: **${cardsTotal}**\n6 :star:: **${cardsTotal6Stars}**\n5 :star:: **${cardsTotal5Stars}**`,
        true
      )
      .addField(
        `Profile stats`,
        `Total profiles: **${profileTotal}**\nRelationship count: **${relationships}**\nRichest user: <@${richestUser}>\nTop collector: <@${topCollector.id}> (**${topCollector.count}** cards)`,
        true
      )
      .setColor("#40BD66");
    await msg.channel.send(embed);
    return;
  };
}

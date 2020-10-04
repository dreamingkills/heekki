import { Message, MessageEmbed } from "discord.js";
import { TradeService } from "../../database/service/TradeService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["trades"];
  async exec(msg: Message, executor: Profile) {
    /*const trades = await TradeService.getTradeRequests(msg.author.id);

    const singleTrades = trades.filter(
      (v, i, a) => a.findIndex((t) => t.unique === v.unique) === i
    );
    const embed = new MessageEmbed()
      .setAuthor(`Trades | ${msg.author.tag}`)
      .setDescription(
        `**Trade ID** with **User**\n${singleTrades
          .map(
            (t: {
              unique: string;
              sender: string;
              recipient: string;
              senderCard: number;
              recipientCard: number;
            }) => {
              return `\`${t.unique}\` with <@${
                msg.author.id === t.recipient ? t.sender : t.recipient
              }> (${msg.author.id === t.sender ? "outgoing" : "incoming"})`;
            }
          )
          .join("\n")}`
      )
      .setFooter(`To accept a trade, use !accept <trade id>`)
      .setColor(`#FFAACC`);
    msg.channel.send(embed);*/
  }
}

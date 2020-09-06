import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { TradeService } from "../../database/service/TradeService";

export class Command extends GameCommand {
  names: string[] = ["trades"];
  usage: string[] = ["%c"];
  desc: string = "Shows your active trade requests..";
  category: string = "card";

  exec = async (msg: Message) => {
    const trades = await TradeService.getTradeRequests(msg.author.id);

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
      .setFooter(`To accept a trade, use !accept <trade id>`);

    await msg.channel.send(embed);
    return;
  };
}

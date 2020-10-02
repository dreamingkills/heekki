import { Message, MessageEmbed } from "discord.js";
import { TradeService } from "../../database/service/TradeService";
import { UserCardService } from "../../database/service/UserCardService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["showtrade", "st"];
  async exec(msg: Message, executor: Profile) {
    const tradeCards = await TradeService.getTradeByUnique(this.options[0]);
    let transferData = [];
    for (let trade of tradeCards) {
      if (trade.senderCard === 0) {
        const card = await UserCardService.getUserCardById(trade.recipientCard);
        transferData.push({
          card1Reference: "Nothing",
          card2Reference: `${card.abbreviation}#${card.serialNumber}`,
        });
      } else if (trade.recipientCard === 0) {
        const card = await UserCardService.getUserCardById(trade.senderCard);
        transferData.push({
          card1Reference: `${card.abbreviation}#${card.serialNumber}`,
          card2Reference: `Nothing`,
        });
      } else {
        const senderCard = await UserCardService.getUserCardById(
          trade.senderCard
        );
        const recipientCard = await UserCardService.getUserCardById(
          trade.recipientCard
        );
        transferData.push({
          card1Reference: `${senderCard.abbreviation}#${senderCard.serialNumber}`,
          card2Reference: `${recipientCard.abbreviation}#${recipientCard.serialNumber}`,
        });
      }
    }

    const embed = new MessageEmbed()
      .setAuthor(`Trade Details | ${this.options[0]}`)
      .setDescription(
        `<@${tradeCards[0].sender}> <==> <@${
          tradeCards[0].recipient
        }>\n${transferData
          .map((t) => {
            return `**${t.card1Reference}** <==> **${t.card2Reference}**`;
          })
          .join("\n")}\n\n**Trade Type**: ${
          tradeCards[0].recipient === msg.author.id ? "Incoming" : "Outgoing"
        }`
      )
      .setColor(`#FFAACC`);

    msg.channel.send(embed);
  }
}

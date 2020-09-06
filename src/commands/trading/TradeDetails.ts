import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { TradeService } from "../../database/service/TradeService";
import { CardService } from "../../database/service/CardService";
import { UserCardService } from "../../database/service/UserCardService";
import { UserCard } from "../../structures/player/UserCard";

export class Command extends GameCommand {
  names: string[] = ["showtrade", "st"];
  usage: string[] = ["%c <trade id>"];
  desc: string = "Shows an active trade.";
  category: string = "card";

  exec = async (msg: Message) => {
    const tradeCards = await TradeService.getTradeByUnique(this.prm[0]);
    let transferData = [];
    for (let trade of tradeCards) {
      if (trade.senderCard === 0) {
        const card = (
          await UserCardService.getCardByUserCardId(trade.recipientCard)
        ).userCard;
        transferData.push({
          card1Reference: "Nothing",
          card2Reference: `${card.abbreviation}#${card.serialNumber}`,
        });
      } else if (trade.recipientCard === 0) {
        const card = (
          await UserCardService.getCardByUserCardId(trade.senderCard)
        ).userCard;
        transferData.push({
          card1Reference: `${card.abbreviation}#${card.serialNumber}`,
          card2Reference: `Nothing`,
        });
      } else {
        const senderCard = (
          await UserCardService.getCardByUserCardId(trade.senderCard)
        ).userCard;
        const recipientCard = (
          await UserCardService.getCardByUserCardId(trade.recipientCard)
        ).userCard;
        transferData.push({
          card1Reference: `${senderCard.abbreviation}#${senderCard.serialNumber}`,
          card2Reference: `${recipientCard.abbreviation}#${recipientCard.serialNumber}`,
        });
      }
    }

    const embed = new MessageEmbed()
      .setAuthor(`Trade Details | ${this.prm[0]}`)
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
      );

    await msg.channel.send(embed);
    return;
  };
}

import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { MarketService } from "../../database/service/MarketService";
import { StatsService } from "../../database/service/StatsService";

export class Command extends GameCommand {
  names: string[] = ["buycard", "mpb"];
  usage: string[] = ["%c <card reference>"];
  desc: string = "Puts a card up for sale on the marketplace.";
  category: string = "market";

  exec = async (msg: Message) => {
    let buy = await MarketService.purchaseCard(msg.author.id, {
      abbreviation: this.prm[0]?.split("#")[0],
      serial: parseInt(this.prm[0]?.split("#")[1]),
    });

    StatsService.incrementStat("market_sales");

    if (buy.seller) {
      const seller = await msg.client.users.fetch(buy.seller.discord_id);
      if (seller)
        seller.send(
          `:white_check_mark: Your card **${buy.card.abbreviation}#${buy.card.serialNumber}** has been purchased by **${msg.author.tag}**.`
        );
    }

    msg.channel.send(
      `:white_check_mark: Successfully purchased **${buy.card.abbreviation}#${
        buy.card.serialNumber
      }**!\nYour new balance is <:coin:745447920072917093> **${
        buy.buyer.coins - buy.price
      }**.`
    );
  };
}

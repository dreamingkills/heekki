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
    msg.channel.send(
      `:white_check_mark: Successfully purchased **${buy.card.abbreviation}#${
        buy.card.serialNumber
      }** from ${
        buy.seller ? `<@${buy.seller.discord_id}>` : "No one!"
      }.\nYour new balance is <:coin:745447920072917093> **${
        buy.buyer.coins - buy.price
      }**.`
    );
  };
}

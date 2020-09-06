import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { MarketService } from "../../database/service/MarketService";
import { TradeService } from "../../database/service/TradeService";

export class Command extends GameCommand {
  names: string[] = ["trade"];
  usage: string[] = ["%c <card reference/s> for <card reference/s>"];
  desc: string = "Sends a trade request to another user";
  category: string = "card";

  exec = async (msg: Message) => {
    const refs = this.prm.join(" ").split("for");
    let refsSender = refs[0].split(" ").filter((e) => e);
    let refsOther = refs[1].split(" ").filter((e) => e);

    const tradeRequest = await TradeService.createNewTradeRequest(
      refsSender,
      refsOther,
      msg.author.id
    );
    await msg.channel.send(
      `:white_check_mark: Created a trade request with **<@${tradeRequest.recipient}>**.\nTo accept the trade, they can run \`!accept ${tradeRequest.unique}\``
    );
    return;
  };
}

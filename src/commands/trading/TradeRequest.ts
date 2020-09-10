import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { TradeService } from "../../database/service/TradeService";

export class Command extends GameCommand {
  names: string[] = ["trade"];
  usage: string[] = ["%c <card reference/s> for <card reference/s>"];
  desc: string = "Sends a trade request to another user";
  category: string = "card";

  exec = async (msg: Message) => {
    const refs = this.prm.join(" ")?.split("for");
    if (!refs[0]) {
      msg.channel.send(
        "<:red_x:741454361007357993> Please enter a card to trade."
      );
      return;
    }
    if (!refs[1]) {
      msg.channel.send(
        `<:red_x:741454361007357993> Please enter a card to trade for.`
      );
      return;
    }
    let refsSender = refs[0].split(" ").filter((e) => e);
    let refsOther = refs[1].split(" ").filter((e) => e);

    const tradeRequest = await TradeService.createNewTradeRequest(
      refsSender,
      refsOther,
      msg.author.id
    );
    msg.channel.send(
      `:white_check_mark: Created a trade request with **<@${tradeRequest.recipient}>**.\nTo accept the trade, they can run \`!accept ${tradeRequest.unique}\``
    );
  };
}

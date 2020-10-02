import { Message } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { TradeService } from "../../database/service/TradeService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["trade"];
  async exec(msg: Message, executor: Profile) {
    const refs = this.options.join(" ")?.split("for");
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
    let refsSender = refs[0].split(" ").filter((e) => e.trim().includes("#"));
    if (!refsSender[0]) {
      msg.channel.send(
        `<:red_x:741454361007357993> You haven't specified any of your cards.`
      );
      return;
    }
    let refsOther = refs[1].split(" ").filter((e) => e.trim().includes("#"));
    if (!refsOther[0]) {
      msg.channel.send(
        `<:red_x:741454361007357993> You haven't specified any cards to trade for.`
      );
      return;
    }
    let cardsSender = [];
    let cardsRecipient = [];

    for (let ref of refsSender) {
      const reference = {
        identifier: ref.split("#")[0],
        serial: parseInt(ref.split("#")[1]),
      };
      const card = await CardService.getCardDataFromReference(reference);
      cardsSender.push(card);
    }
    for (let ref of refsOther) {
      const reference = {
        identifier: ref.split("#")[0],
        serial: parseInt(ref.split("#")[1]),
      };
      const card = await CardService.getCardDataFromReference(reference);
      cardsRecipient.push(card);
    }

    const tradeRequest = await TradeService.createNewTradeRequest(
      cardsSender,
      cardsRecipient,
      msg.author.id
    );
    msg.channel.send(
      `:white_check_mark: Created a trade request with **<@${tradeRequest.recipient}>**.\nTo accept the trade, they can run \`!accept ${tradeRequest.unique}\``
    );
  }
}

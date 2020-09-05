import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";

export class Command extends GameCommand {
  names: string[] = ["gift"];
  usage: string[] = ["%c <card id> <mention>"];
  desc: string = "Gifts a card to someone, for free!";
  category: string = "player";

  exec = async (msg: Message) => {
    const gift = await PlayerService.giftCard(
      msg.author.id,
      this.parseMention(this.prm[0]),
      {
        abbreviation: this.prm[1].split("#")[0],
        serial: parseInt(this.prm[1].split("#")[2]),
      }
    );

    const user = msg.client.users.resolve(gift.ownerId)!;
    await msg.channel.send(
      `:gift: You gifted **${gift.abbreviation}#${gift.serialNumber}** to **${
        user.tag || `Unknown User (<@${gift.ownerId}>)`
      }**!`
    );
    return;
  };
}

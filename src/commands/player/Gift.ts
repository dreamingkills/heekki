import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";

export class Command extends GameCommand {
  names: string[] = ["gift"];
  usage: string[] = ["%c <card id> <mention>"];
  desc: string = "Gifts a card to someone, for free!";
  category: string = "player";

  exec = async (msg: Message) => {
    let gift = await PlayerService.giftCard(
      msg.author.id,
      this.prm[0],
      this.prm[1]
    );

    let user = msg.client.users.resolve(gift.ownerId)!;
    await msg.channel.send(
      `:gift: You gifted **${gift.abbreviation}#${gift.serialNumber}** to **${
        user.tag || `Unknown User (<@${gift.ownerId}>)`
      }**!`
    );
    return;
  };
}

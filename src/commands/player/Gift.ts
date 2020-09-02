import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/Player";

export class Command extends GameCommand {
  names: string[] = ["gift"];
  usage: string[] = ["%c <card id> <mention>"];
  desc: string = "Gifts a card to someone, for free!";
  category: string = "player";

  exec = async (msg: Message) => {
    /*let gift = await PlayerService.giftCard(this.prm[0], this.prm[1]);

    await msg.channel.send(`:gift: You gifted **${this.prm[0]}**`);
    return;*/
  };
}

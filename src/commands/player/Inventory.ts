import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/player/Player";

export class Command extends GameCommand {
  names: string[] = ["inventory"];
  usage: string[] = ["%c [page]"];
  desc: string = "Shows a user's inventory.";
  category: string = "player";

  exec = async (msg: Message) => {
    let id = msg.author.id;
    let page = this.prm[0] ? parseInt(this.prm[0]) : 1;
    let user = await PlayerService.getProfileFromUser(id, true);
    let cards = await PlayerService.getCardsByUser(
      user!.discord_id,
      true,
      page
    );
    let desc = "";

    for (let card of cards) {
      desc += `**${card.collection}** - ${card.member}\nLevel ${card.level} - **${card.hearts}** :heart:\n`;
    }
    let embed = new MessageEmbed()
      .setAuthor(`${msg.author.tag}'s inventory`)
      .setDescription(desc)
      .setThumbnail(msg.author.displayAvatarURL())
      .setColor("#40BD66");
    await msg.channel.send(embed);
  };
}

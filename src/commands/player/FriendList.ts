import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/Player";
import moment from "moment";

export class Command extends GameCommand {
  names: string[] = ["friends"];
  usage: string[] = ["%c [page]"];
  desc: string = "Shows you your friends list!";
  category: string = "player";

  exec = async (msg: Message) => {
    let friendsRaw = await PlayerService.getFriendsList(msg.author.id);
    let page = parseInt(this.prm[0]) || 1;

    let friends = friendsRaw.slice(10 * page - 10, 10 * page);
    if (friends.length == 0) friends = friendsRaw.slice(0, 10);
    let embed = new MessageEmbed()
      .setAuthor(`${msg.author.tag}'s friends (${friendsRaw.length} total)`)
      .setDescription(
        friends.length > 0
          ? `<@${friends.join(">\n<@")}>`
          : "You don't have any friends :("
      )
      .setThumbnail(msg.author.displayAvatarURL())
      .setFooter(`Use !friends <page> to view another page!`)
      .setColor("40BD66");
    await msg.channel.send(embed);
    return;
  };
}

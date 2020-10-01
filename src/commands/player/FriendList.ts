import {
  Client,
  Message,
  MessageEmbed,
  MessageReaction,
  TextChannel,
  User,
} from "discord.js";
import { FriendService } from "../../database/service/FriendService";
import { BaseCommand } from "../../structures/command/Command";
import { ClientError } from "../../structures/Error";
import { Friend } from "../../structures/player/Friend";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["friends"];
  private async parseFriends(
    friends: Friend[],
    sender: Profile,
    client: Client
  ): Promise<string> {
    const friendIds = friends.map((f) => {
      return sender.discord_id === f.sender ? f.recipient : f.sender;
    });
    const friendCounts = await FriendService.getTotalHeartsSent(
      sender,
      friendIds
    );
    let tags = [];
    for (const friend of friendCounts) {
      tags.push(
        `${
          (await client.users.fetch(friend.sender_id)) ||
          `Unknown User (${friend.sender_id})`
        } - **${friend.count}** <:heekki_heart:757147742383505488> received`
      );
    }
    return tags.join("\n");
  }

  exec = async (msg: Message, executor: Profile) => {
    let page = parseInt(this.options[0]);
    if (isNaN(page)) page = 1;

    const friendCount = await FriendService.getNumberOfFriendsByProfile(
      executor
    );
    const pageLimit = Math.ceil(friendCount / 20);
    if (page > pageLimit) page = pageLimit;
    const friendsRaw = await FriendService.getFriendsByProfile(
      executor,
      isNaN(page) ? 1 : page
    );
    const friends = await this.parseFriends(friendsRaw, executor, msg.client);

    const embed = new MessageEmbed()
      .setAuthor(
        `Friends | ${msg.author.tag} (page 1/${pageLimit})`,
        msg.author.displayAvatarURL()
      )
      .setDescription(
        friends.length > 0 ? friends : "You don't have any friends :("
      )
      .setThumbnail(msg.author.displayAvatarURL())
      .setColor("#FFAACC");
    const sent = await msg.channel.send(embed);

    if (pageLimit > 1) await sent.react("◀️");
    await sent.react("754832389620105276");
    if (pageLimit > 1) await sent.react("▶️");

    let filter;
    if (pageLimit > 1) {
      filter = (r: MessageReaction, u: User) =>
        (r.emoji.name === "◀️" ||
          r.emoji.name === "delete" ||
          r.emoji.name === "▶️") &&
        msg.author.id === u.id;
    } else
      filter = (r: MessageReaction, u: User) =>
        r.emoji.name === "delete" && msg.author.id === u.id;

    const collector = sent.createReactionCollector(filter, { time: 300000 });
    collector.on("collect", async (r) => {
      if (r.emoji.name === "◀️" && page !== 1) {
        page--;
        const newFriends = await FriendService.getFriendsByProfile(executor);
        sent.edit(
          embed
            .setAuthor(
              `Friends | ${msg.author.tag} (page ${page}/${pageLimit})`,
              msg.author.displayAvatarURL()
            )
            .setDescription(this.parseFriends(newFriends, executor, msg.client))
        );
      } else if (r.emoji.name === "delete") {
        return (<TextChannel>msg.channel).bulkDelete([msg, sent]);
      } else if (r.emoji.name === "▶️" && page !== pageLimit) {
        page++;
        const newFriends = await FriendService.getFriendsByProfile(executor);
        sent.edit(
          embed
            .setAuthor(
              `Friends | ${msg.author.tag} (page ${page}/${pageLimit})`,
              msg.author.displayAvatarURL()
            )
            .setDescription(this.parseFriends(newFriends, executor, msg.client))
        );
      }
      r.users.remove(msg.author);
    });
    collector.on("end", async () => {
      if (!sent.deleted) sent.reactions.removeAll();
    });
  };
}

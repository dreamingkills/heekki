import {
  Client,
  Message,
  MessageEmbed,
  MessageReaction,
  TextChannel,
  User,
} from "discord.js";
import { FriendService } from "../../database/service/FriendService";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import { Friend } from "../../structures/player/Friend";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["friend"];
  private async parseFriends(
    friends: Friend[],
    sender: Profile,
    client: Client
  ): Promise<string> {
    console.log(friends);
    const friendIds = friends.map((f) => {
      return f.sender === sender.discord_id ? f.recipient : f.sender;
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
    switch (this.options[0]?.toLowerCase()) {
      case "add": {
        if (!this.options[1]) {
          msg.channel.send(
            `<:red_x:741454361007357993> Please specify a user to add!`
          );
          return;
        }
        let friend;

        if (!this.options[1].includes("<@")) {
          const member = await msg.guild?.members.fetch({
            query: this.options.slice(1).join(" "),
          });
          friend = member?.firstKey();
          if (!friend) {
            await msg.channel.send(
              "<:red_x:741454361007357993> Sorry, but I couldn't find that user."
            );
            return;
          }
        } else {
          friend = this.parseMention(this.options[1]);
        }

        const friendProfile = await PlayerService.getProfileByDiscordId(friend);
        if (executor.discord_id == friendProfile.discord_id) {
          msg.channel.send(
            "<:red_x:741454361007357993> You can't add yourself as a friend."
          );
          return;
        }

        const relationship = await FriendService.checkRelationshipExists(
          executor,
          friendProfile
        );

        switch (relationship) {
          case "ACCEPTABLE": {
            await FriendService.acceptFriendRequest(friendProfile, executor);
            msg.channel.send(`:white_check_mark: Friend request accepted.`);
            return;
          }
          case "REQUESTED": {
            msg.channel.send(
              `<:red_x:741454361007357993> You've already sent a friend request to that user!`
            );
            return;
          }
          case "ALREADY_FRIENDS": {
            msg.channel.send(
              `<:red_x:741454361007357993> You're already friends with them!`
            );
            return;
          }
          case "ERROR": {
            msg.channel.send(
              `<:red_x:741454361007357993> An unexpected error occurred! Please try again.`
            );
            return;
          }
        }

        FriendService.addFriend(executor, friendProfile);

        const newUser = await msg.client.users.fetch(friendProfile.discord_id);
        msg.channel.send(
          `:white_check_mark: Sent a friend request to **${newUser?.tag}**!`
        );
        return;
      }
      case "remove": {
        if (!this.options[1]) {
          msg.channel.send(
            `<:red_x:741454361007357993> Please specify a user to unfriend!`
          );
          return;
        }
        let friend;

        if (
          isNaN(parseInt(this.options[1])) &&
          !this.options[1].includes("<@")
        ) {
          const member = await msg.guild?.members.fetch({
            query: this.options.slice(1).join(" "),
          });
          friend = member?.firstKey();
          if (!friend) {
            msg.channel.send(
              "<:red_x:741454361007357993> Sorry, but I couldn't find that user."
            );
            return;
          }
        } else {
          friend = this.parseMention(this.options[1]);
        }

        const friendProfile = await PlayerService.getProfileByDiscordId(friend);
        const relationshipExists = await FriendService.checkRelationshipExists(
          executor,
          friendProfile
        );
        switch (relationshipExists) {
          case "OK": {
            await msg.channel.send(
              `<:red_x:741454361007357993> You aren't friends with them.`
            );
            return;
          }
          case "ERROR": {
            msg.channel.send(
              `<:red_x:741454361007357993> An unexpected error occurred! Please try again.`
            );
            return;
          }
          default: {
            await FriendService.removeFriend(executor, friendProfile);
            msg.channel.send(
              `:white_check_mark: Removed them from your friends list.`
            );
            return;
          }
        }
      }
      case "list": {
        let page = parseInt(this.options[1]);
        if (isNaN(page)) page = 1;

        const friendCount = await FriendService.getNumberOfFriendsByProfile(
          executor
        );
        const pageLimit = Math.ceil(friendCount / 20);
        if (page > pageLimit) page = pageLimit;
        const friendsRaw = await FriendService.getFriendsByProfile(
          executor,
          page
        );
        const friends = await this.parseFriends(
          friendsRaw,
          executor,
          msg.client
        );

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

        const collector = sent.createReactionCollector(filter, {
          time: 300000,
        });
        collector.on("collect", async (r) => {
          if (r.emoji.name === "◀️" && page !== 1) {
            page--;
            const newFriends = await FriendService.getFriendsByProfile(
              executor
            );
            sent.edit(
              embed
                .setAuthor(
                  `Friends | ${msg.author.tag} (page ${page}/${pageLimit})`,
                  msg.author.displayAvatarURL()
                )
                .setDescription(
                  this.parseFriends(newFriends, executor, msg.client)
                )
            );
          } else if (r.emoji.name === "delete") {
            return (<TextChannel>msg.channel).bulkDelete([msg, sent]);
          } else if (r.emoji.name === "▶️" && page !== pageLimit) {
            page++;
            const newFriends = await FriendService.getFriendsByProfile(
              executor
            );
            sent.edit(
              embed
                .setAuthor(
                  `Friends | ${msg.author.tag} (page ${page}/${pageLimit})`,
                  msg.author.displayAvatarURL()
                )
                .setDescription(
                  this.parseFriends(newFriends, executor, msg.client)
                )
            );
          }
          r.users.remove(msg.author);
        });
        collector.on("end", async () => {
          if (!sent.deleted) sent.reactions.removeAll();
        });
        return;
      }
      case "requests": {
        const incomingRequests = await FriendService.getIncomingFriendRequests(
          executor
        );
        const embed = new MessageEmbed()
          .setAuthor(
            `Friend Requests | ${msg.author.tag}`,
            msg.author.displayAvatarURL()
          )
          .setDescription(
            `**Incoming friend requests**:\n${incomingRequests
              .map((r) => {
                return `<@${r.sender}>`;
              })
              .join("\n")}\n\nUse \`!add <user>\` to accept the request!`
          )
          .setThumbnail(msg.author.displayAvatarURL())
          .setColor(`#FFAACC`);
        if (incomingRequests.length === 0)
          embed.setDescription(`No incoming friend requests.`);
        msg.channel.send(embed);
        return;
      }
    }

    const helpEmbed = new MessageEmbed()
      .setAuthor(
        `Help - Friends | ${msg.author.tag}`,
        msg.author.displayAvatarURL()
      )
      .setColor(`#FFAACC`)
      .setDescription(
        `**Friends on Heekki**\nYou can add friends to receive hearts from them whenever they send them. To send your friends some hearts, you can use \`!send\` - this comes at no cost to you.\n- To send or accept a friend request, use \`!friend add\`.\n- To unfriend or reject a friend request, use \`!friend remove\`.\n\n**Subcommands**\n\`\`\`!friend add <user>\n!friend remove <user>\n!friend list\n!friend requests\`\`\``
      );
    msg.channel.send(helpEmbed);
  };
}

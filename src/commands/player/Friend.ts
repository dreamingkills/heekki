import {
  Client,
  Message,
  MessageEmbed,
  MessageReaction,
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
    const friendIds = friends.map((f) => {
      if (f.sender === sender.discord_id) return f.recipient;
      return f.sender;
    });
    const friendCounts = await FriendService.getTotalHeartsSent(
      sender,
      friendIds
    );
    let tags = [];
    for (const friend of friendIds) {
      const user = await client.users.fetch(friend);
      tags.push(
        `${user?.tag || `Unknown User (${friend})`} - **${
          friendCounts.filter((r) => {
            return r.sender_id === friend;
          })[0]?.count || 0
        }** ${this.bot.config.discord.emoji.hearts.full} received`
      );
    }
    return tags.join("\n");
  }

  async exec(msg: Message, executor: Profile) {
    const prefix = this.bot.getPrefix(msg.guild!.id);
    switch (this.options[0]?.toLowerCase()) {
      case "all": {
        await FriendService.acceptAllFriendRequests(executor);
        await msg.channel.send(
          `${this.bot.config.discord.emoji.check.full} Accepted all friend requests!`
        );
        return;
      }
      case "add": {
        if (!this.options[1]) {
          await msg.channel.send(
            `${this.bot.config.discord.emoji.cross.full} Please specify a user to add!`
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
              `${this.bot.config.discord.emoji.cross.full} Sorry, but I couldn't find that user.`
            );
            return;
          }
        } else {
          friend = this.parseMention(this.options[1]);
        }

        const friendProfile = await PlayerService.getProfileByDiscordId(friend);
        if (executor.discord_id == friendProfile.discord_id) {
          await msg.channel.send(
            `${this.bot.config.discord.emoji.cross.full} You can't add yourself as a friend.`
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
            await msg.channel.send(
              `${this.bot.config.discord.emoji.check.full} Friend request accepted.`
            );
            return;
          }
          case "REQUESTED": {
            await msg.channel.send(
              `${this.bot.config.discord.emoji.cross.full} You've already sent a friend request to that user!`
            );
            return;
          }
          case "ALREADY_FRIENDS": {
            await msg.channel.send(
              `${this.bot.config.discord.emoji.cross.full} You're already friends with them!`
            );
            return;
          }
          case "ERROR": {
            await msg.channel.send(
              `${this.bot.config.discord.emoji.cross.full} An unexpected error occurred! Please try again.`
            );
            return;
          }
        }

        await FriendService.addFriend(executor, friendProfile);

        const newUser = await msg.client.users.fetch(friendProfile.discord_id);
        await msg.channel.send(
          `${this.bot.config.discord.emoji.check.full} Sent a friend request to **${newUser?.tag}**!`
        );
        return;
      }
      case "remove": {
        if (!this.options[1]) {
          await msg.channel.send(
            `${this.bot.config.discord.emoji.cross.full} Please specify a user to unfriend!`
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
            await msg.channel.send(
              `${this.bot.config.discord.emoji.cross.full} Sorry, but I couldn't find that user.`
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
              `${this.bot.config.discord.emoji.cross.full} You aren't friends with them.`
            );
            return;
          }
          case "ERROR": {
            await msg.channel.send(
              `${this.bot.config.discord.emoji.cross.full} An unexpected error occurred! Please try again.`
            );
            return;
          }
          default: {
            await FriendService.removeFriend(executor, friendProfile);
            await msg.channel.send(
              `${this.bot.config.discord.emoji.check.full} Removed them from your friends list.`
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
        if (page > pageLimit && pageLimit != 0) page = pageLimit;
        const friendsRaw = await FriendService.getFriendsByProfile(
          executor,
          page
        );
        if (friendsRaw.length === 0) {
          const embed = new MessageEmbed()
            .setAuthor(
              `Friends | ${msg.author.tag} (page 1/1)`,
              msg.author.displayAvatarURL()
            )
            .setDescription(`You don't have any friends :(`)
            .setThumbnail(msg.author.displayAvatarURL())
            .setColor(`#FFAACC`);
          await msg.channel.send(embed);
          return;
        }
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
        await sent.react(this.bot.config.discord.emoji.delete.id);
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
          if (r.emoji.name === "◀️" && page !== 1) page--;
          if (r.emoji.name === "delete") await sent.delete();
          if (r.emoji.name === "▶️" && page !== pageLimit) page++;

          const newFriends = await FriendService.getFriendsByProfile(
            executor,
            page
          );
          await sent.edit(
            embed
              .setAuthor(
                `Friends | ${msg.author.tag} (page ${page}/${pageLimit})`,
                msg.author.displayAvatarURL()
              )
              .setDescription(
                await this.parseFriends(newFriends, executor, msg.client)
              )
          );
          r.users.remove(msg.author);
        });
        collector.on("end", async () => {
          if (!sent.deleted && this.permissions.MANAGE_MESSAGES)
            await sent.reactions.removeAll();
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
              .join(
                "\n"
              )}\n\nUse \`${prefix}friend add <user>\` to accept the request!`
          )
          .setThumbnail(msg.author.displayAvatarURL())
          .setColor(`#FFAACC`);
        if (incomingRequests.length === 0)
          embed.setDescription(`No incoming friend requests.`);
        await msg.channel.send(embed);
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
        `**Friends on Heekki**\nYou can add friends to receive hearts from them whenever they send them. To send your friends some hearts, you can use \`${prefix}send\` - this comes at no cost to you.\n- To send or accept a friend request, use \`${prefix}friend add\`.\n- To unfriend or reject a friend request, use \`${prefix}friend remove\`.\n\n**Subcommands**\n\`\`\`${prefix}friend add <user>\n${prefix}friend remove <user>\n${prefix}friend list\n${prefix}friend requests\n!friend all\`\`\``
      );
    await msg.channel.send(helpEmbed);
    return;
  }
}

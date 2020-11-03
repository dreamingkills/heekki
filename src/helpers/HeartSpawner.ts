import Chance from "chance";
import { MessageEmbed, MessageReaction, TextChannel, User } from "discord.js";
import { PlayerService } from "../database/service/PlayerService";

export class HeartSpawner {
  static chance = new Chance();
  public static async spawn(spawnChannel: TextChannel): Promise<void> {
    const random = this.chance.integer({ min: 32, max: 71 });

    const embed = new MessageEmbed()
      .setAuthor(`Heart Spawns`, `https://i.imgur.com/KTkUpIn.png`)
      .setDescription(
        `**${random}** <:heekki_heart:757147742383505488> have spawned!\nClick the reaction to claim!`
      )
      .setFooter(`All users who react will be rewarded.`)
      .setColor(`#FFAACC`)
      .setThumbnail(`https://i.imgur.com/KTkUpIn.png`);

    const sent = await spawnChannel.send(embed);
    await sent.react("❤️");

    const filter = (reaction: MessageReaction, user: User) =>
      reaction.emoji.name === "❤️" && !user.bot;
    const collector = await sent.awaitReactions(filter, {
      time: 5000,
      max: 1,
    });
    const users = collector.first()?.users?.cache.array();
    if (users) {
      const profiles = [];
      for (let user of users) {
        try {
          const profile = await PlayerService.getProfileByDiscordId(user.id);
          profiles.push(profile);
        } catch (e) {}
      }

      for (let profile of profiles) {
        await PlayerService.addCoinsToProfile(
          profile,
          random / profiles.length
        );
      }

      const successEmbed = new MessageEmbed()
        .setAuthor(`Heart Spawns`, `https://i.imgur.com/KTkUpIn.png`)
        .setDescription(
          `<:heekki_heart:757147742383505488> **${random}** was distributed evenly to **${profiles.length}** players!`
        )
        .setColor(`#FFAACC`);
      await sent.edit(successEmbed);
    }

    setTimeout(
      () => this.spawn(spawnChannel),
      this.chance.integer({
        min: 420000,
        max: 1140000,
      })
    );
  }
}

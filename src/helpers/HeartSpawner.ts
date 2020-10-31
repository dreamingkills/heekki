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
      .setFooter(`The first person to react will be rewarded.`)
      .setColor(`#FFAACC`)
      .setThumbnail(`https://i.imgur.com/KTkUpIn.png`);

    const sent = await spawnChannel.send(embed);
    await sent.react("❤️");

    const filter = (reaction: MessageReaction, user: User) =>
      reaction.emoji.name === "❤️" && !user.bot;
    const collector = sent.createReactionCollector(filter, {
      time: 30000,
      max: 1,
    });
    collector.on("collect", async (r, u) => {
      try {
        const profile = await PlayerService.getProfileByDiscordId(u.id);
        await PlayerService.addHeartsToProfile(profile, random);
      } catch (e) {
        console.log(e);
        // ignore
      }
      await sent.edit(
        embed.setDescription(
          `**${u.tag}** was awarded **${random}** <:heekki_heart:757147742383505488>!`
        )
      );
    });
    collector.on("end", async (collected, reason) => {
      if (reason === "time") {
        await sent.delete();
        return;
      }
      setTimeout(
        () => this.spawn(spawnChannel),
        this.chance.integer({
          min: 420000,
          max: 1140000,
        })
      );
    });
  }
}

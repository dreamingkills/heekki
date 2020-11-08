import Chance from "chance";
import { MessageEmbed, TextChannel, User } from "discord.js";
import { PlayerService } from "../database/service/PlayerService";
import config from "../../config.json";

export class HeartSpawner {
  static chance = new Chance();
  public static async spawn(spawnChannel: TextChannel): Promise<void> {
    const random = this.chance.integer({ min: 32, max: 71 });

    const embed = new MessageEmbed()
      .setAuthor(`Heart Spawns`, `https://i.imgur.com/KTkUpIn.png`)
      .setDescription(
        `${config.discord.emoji.hearts.full} **${random}** have spawned!\nClick the reaction to claim!`
      )
      .setFooter(`All users who react will be rewarded.`)
      .setColor(`#FFAACC`)
      .setThumbnail(`https://i.imgur.com/KTkUpIn.png`);

    const sent = await spawnChannel.send(embed);
    await sent.react(config.discord.emoji.hearts.id);

    const filter = () => true;
    const collector = sent.createReactionCollector(filter, {
      time: 3000,
      dispose: true,
    });
    let users: User[] = [];

    collector.on("collect", async (_, u) => {
      console.log("collected");
      users.push(u);
    });

    collector.on("end", async () => {
      const perUser = Math.floor(random / users.length);
      console.log(users);
      for (let user of users) {
        console.log(user);
        const profile = await PlayerService.getProfileByDiscordId(user.id);
        await PlayerService.addCoinsToProfile(profile, perUser);
      }

      const successEmbed = new MessageEmbed()
        .setAuthor(`Heart Spawns`, `https://i.imgur.com/KTkUpIn.png`)
        .setDescription(
          `${config.discord.emoji.hearts.full} **${random}** was distributed evenly to **${users.length}** players!`
        )
        .setColor(`#FFAACC`);
      await sent.edit(successEmbed);

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

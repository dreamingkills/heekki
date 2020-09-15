import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import Chance from "chance";
import fish from "../../assets/fish.json";
import { PlayerService } from "../../database/service/PlayerService";

export class Command extends GameCommand {
  names: string[] = ["fishing"];
  usage: string[] = ["%c"];
  desc: string = "gone fishin yeehaw :cowboy:";
  category: string = "player";

  private async generateFish(
    force?: string
  ): Promise<{
    name: string;
    gender: "male" | "female" | "???";
    weight: number;
    weightMod: { name: string; multiplier: number; baseChance: number };
    emoji: string;
  }> {
    const fishBias = [];
    for (let fishy of fish.fish) {
      fishBias.push(fishy.baseChance);
    }
    const chance = new Chance();
    let randomFish;
    if (force) {
      randomFish = fish.fish.filter((fishy) => {
        return fishy.name === force;
      })[0];
    } else {
      randomFish = chance.weighted(fish.fish, fishBias);
    }

    let gender = chance.pickone(Object.keys(randomFish.weight)) as
      | "male"
      | "female"
      | "???";
    const weightRaw = chance.floating({
      fixed: 2,
      min: randomFish.weight[gender]!.min,
      max: randomFish.weight[gender]!.max,
    });

    const weightBias = [];
    for (let weightModChance of fish.weightModifiers) {
      weightBias.push(weightModChance.baseChance);
    }
    const weightMod = chance.weighted(fish.weightModifiers, weightBias);

    return {
      name: randomFish.name,
      gender,
      weight: weightRaw,
      weightMod,
      emoji: randomFish.emoji,
    };
  }

  exec = async (msg: Message) => {
    const fishingEmbed = new MessageEmbed()
      .setAuthor(`Fishing | ${msg.author.tag}`)
      .setDescription(
        `:fishing_pole_and_fish: You cast your line into the water and wait...`
      )
      .setFooter(`React with the fish emoji when it appears to reel in!`)
      .setColor(`#55acee`);

    const fishingMsg = await msg.channel.send(fishingEmbed);

    const chance = new Chance();
    let caughtFish = false;
    const lineBreakMultiplier = 1; // Upgradable lineBreakMultiplier to reduce chance of line breaking
    let successfulCatches = 0;

    const interval = setInterval(async () => {
      if (fishingMsg.deleted) clearInterval(interval);

      const isFish = chance.integer({ min: 1, max: 4 }) === 2 ? true : false;
      if (isFish) {
        fishingMsg.edit(
          fishingEmbed
            .setDescription(`:warning: Something bit your line!`)
            .setColor(`#ffcd4c`)
        );
        fishingMsg.react("🐟");

        const filter = (reaction: MessageReaction, user: User) =>
          reaction.emoji.name === "🐟" && msg.author.id === user.id;
        const collector = fishingMsg.createReactionCollector(filter, {
          time: 3000,
        });
        collector.on("collect", async () => {
          clearInterval(interval);
          caughtFish = true;
          const caught = await this.generateFish();
          const fishName = `${caught.weightMod.name} ${caught.name}`.trim();
          const fishWeight = parseFloat(
            (caught.weight * caught.weightMod.multiplier).toFixed(4)
          );

          fishingMsg.edit(
            fishingEmbed
              .setDescription(
                `${caught.emoji} You caught a __${
                  caught.weightMod.name !== ""
                    ? fishName.replace(
                        caught.weightMod.name,
                        `**${caught.weightMod.name}**`
                      )
                    : fishName
                }__!\n**Gender**: ${
                  fish.genderEmoji[caught.gender]
                }\n**Weight**: ${fishWeight}g`
              )
              .setColor(`#40BD66`)
              .setFooter(``)
              .setThumbnail(chance.pickone(fish.jinsoul))
          );
          PlayerService.createFishByDiscordId(
            msg.author.id,
            fishName,
            fishWeight,
            caught.gender
          );
          collector.stop("success");
        });
        collector.on("end", (reason: string) => {
          if (!caughtFish) {
            successfulCatches++;
            fishingMsg.reactions.removeAll();
            if (successfulCatches === 3) {
              clearInterval(interval);
              fishingMsg.edit(
                fishingEmbed
                  .setDescription(
                    `<:pensive_fish:754587960745132094> You couldn't catch any fish.`
                  )
                  .setColor(`#D90011`)
              );
              return;
            } else {
              fishingMsg.edit(
                fishingEmbed
                  .setDescription(
                    ":fishing_pole_and_fish: You caught something, but you didn't reel in in time.\nYou continue waiting..."
                  )
                  .setColor(`#55acee`)
              );
            }
          }
        });
      }
    }, 3000);
  };
}

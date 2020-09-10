import { GameCommand } from "../../structures/command/GameCommand";
import {
  Message,
  MessageEmbed,
  User,
  MessageReaction,
  TextChannel,
} from "discord.js";
import { CardService } from "../../database/service/CardService";

export class Command extends GameCommand {
  names: string[] = ["card", "show"];
  usage: string[] = ["%c [card reference]"];
  desc: string = "Generates an image of a card.";
  category: string = "card";
  deletable: boolean = true;

  exec = async (msg: Message) => {
    let card = await CardService.generateCardImageFromReference({
      abbreviation: this.prm[0].split("#")[0],
      serial: parseInt(this.prm[0].split("#")[1]),
    });

    let embed = new MessageEmbed()
      .setDescription(
        `Owner: ${
          card.userCard.ownerId == "0"
            ? "No-one!"
            : `<@${card.userCard.ownerId}>`
        }\n${card.userCard.blurb != "" ? `*"${card.userCard.blurb}"*` : ``}`
      )
      .setColor("#40BD66")
      .setFooter(
        `Card designed by ${card.userCard.credit} - ${
          Date.now() - msg.createdTimestamp
        }ms`
      );
    const sent = await msg.channel.send({ embed: embed, files: [card.image] });

    if (msg.guild?.member(msg.client.user!)?.hasPermission("MANAGE_MESSAGES")) {
      sent.react(`753019858932727868`);
      const collector = sent.createReactionCollector(
        (reaction: MessageReaction, user: User) =>
          reaction.emoji.id === "753019858932727868" &&
          user.id === msg.author.id
      );
      collector.on("collect", (r) =>
        (<TextChannel>msg.channel).bulkDelete([sent, msg])
      );
    }
  };
}

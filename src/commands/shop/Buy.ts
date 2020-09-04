import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed, EmbedFieldData } from "discord.js";
import { ShopService } from "../../database/Shop";
import { CardService } from "../../database/Card";
import moment from "moment";

export class Command extends GameCommand {
  names: string[] = ["buy"];
  usage: string[] = ["%c <pack id>"];
  desc: string =
    "Purchases a roll on a pack, which will give you one random card from that collection.";
  category: string = "shop";

  exec = async (msg: Message) => {
    let packName = this.prm.join(" ");

    let card = await ShopService.rollPack(packName, msg.author.id);

    let cardImage = await CardService.generateCardImage({
      userCard: card.userCard,
      imageData: card.imageData,
    });

    let embed = new MessageEmbed()
      .setAuthor(`You rolled the ${card.userCard.title} pack and got...`)
      .setDescription(
        `**${card.userCard.member}** ${"⭐".repeat(card.userCard.stars)}\n*"${
          card.userCard.blurb
        }"*`
      )
      .setColor("#40BD66")
      .attachFiles([{ name: "card.png", attachment: cardImage.image }])
      .setFooter(
        `${
          card.userCard.abbreviation + "#" + card.userCard.serialNumber
        } • Rolled by ${msg.author.tag} on ${moment().format(
          "MMMM Do YYYY [@] HH:mm:ss"
        )}`
      );
    await msg.channel.send(embed);
    return;
  };
}

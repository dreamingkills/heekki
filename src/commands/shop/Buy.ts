import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { ShopService } from "../../database/service/ShopService";
import { CardService } from "../../database/service/CardService";
import moment from "moment";

export class Command extends GameCommand {
  names: string[] = ["buy"];
  usage: string[] = ["%c <pack id>"];
  desc: string =
    "Purchases a roll on a pack, which will give you one random card from that collection.";
  category: string = "shop";

  exec = async (msg: Message) => {
    const packName = this.prm.join(" ");
    const generatedCard = await ShopService.rollPack(packName, msg.author.id);

    const cardImage = await CardService.generateCardImageFromUserCard({
      userCard: generatedCard.userCard,
      imageData: generatedCard.imageData,
    });

    const userCard = generatedCard.userCard;
    let embed = new MessageEmbed()
      .setAuthor(`You rolled the ${userCard.title} pack and got...`)
      .setDescription(
        `**${userCard.member}** ${"⭐".repeat(userCard.stars)}\n*"${
          userCard.blurb
        }"*`
      )
      .setColor("#40BD66")
      .attachFiles([{ name: "card.png", attachment: cardImage.image }])
      .setFooter(
        `${userCard.abbreviation + "#" + userCard.serialNumber} • Rolled by ${
          msg.author.tag
        } on ${moment().format("MMMM Do YYYY [@] HH:mm:ss")}`
      );
    await msg.channel.send(embed);
    return;
  };
}

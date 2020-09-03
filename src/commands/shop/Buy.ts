import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed, EmbedFieldData } from "discord.js";
import { ShopService } from "../../database/Shop";
import { CardService } from "../../database/Card";

export class Command extends GameCommand {
  names: string[] = ["buy"];
  usage: string[] = ["%c <pack id>"];
  desc: string =
    "Purchases a roll on a pack, which will give you one random card from that collection.";
  category: string = "shop";

  exec = async (msg: Message) => {
    let packName = this.prm.join(" ");

    let pack = await ShopService.rollPack(packName, msg.author.id);

    let cardImage = await CardService.generateCardImage({
      userCard: pack.userCard,
      imageData: pack.imageData,
    });

    let embed = new MessageEmbed()
      .setAuthor(`You rolled the ${pack.userCard.title} pack and got...`)
      .setDescription(
        `**${pack.userCard.member}** ${"⭐".repeat(pack.userCard.stars)}\n*"${
          pack.userCard.blurb
        }"*`
      )
      .setColor("#40BD66")
      .attachFiles([{ name: "card.png", attachment: cardImage.image }]);
    await msg.channel.send(embed);
    return;
  };
}

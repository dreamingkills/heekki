import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed, EmbedFieldData } from "discord.js";
import { ShopService } from "../../database/shop/Shop";
import { PlayerService } from "../../database/player/Player";

export class Command extends GameCommand {
  names: string[] = ["buy"];
  usage: string[] = ["%c <pack id>"];
  desc: string =
    "Purchases a roll on a pack, which will give you one random card from that collection.";
  category: string = "shop";

  exec = async (msg: Message) => {
    let packName = this.prm.join(" ");

    let pack = await ShopService.rollPack(packName, msg.author.id);

    let cardImage = await PlayerService.generateCardImage(
      msg.author.id,
      pack.usercard
    );

    let embed = new MessageEmbed()
      .setAuthor(`You rolled the ${pack.pack.name} pack and got...`)
      .setDescription(
        `**${pack.card.member}** ${"⭐".repeat(pack.usercard.stars)}\n*"${
          pack.card.description
        }"*`
      )
      .setColor("#40BD66")
      .attachFiles([{ name: "card.png", attachment: cardImage }]);
    await msg.channel.send(embed);
    return;
  };
}

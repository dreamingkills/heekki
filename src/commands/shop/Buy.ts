import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed, EmbedFieldData } from "discord.js";
import { ShopService } from "../../database/shop/Shop";

export class Command extends GameCommand {
  names: string[] = ["buy"];
  usage: string[] = ["%c <pack id>"];
  desc: string =
    "Purchases a roll on a pack, which will give you one random card from that collection.";
  category: string = "shop";

  exec = async (msg: Message) => {
    let pack_id = parseInt(this.prm[0]);

    let pack = await ShopService.rollPack(pack_id, msg.author.id);

    let embed = new MessageEmbed()
      .setAuthor(`You rolled ${pack.pack.collection.name} and got...`)
      .setDescription(
        `**${pack.card.member}** ${"⭐".repeat(pack.usercard.stars)}\n*"${
          pack.card.description
        }"*`
      )
      .setImage(pack.card.image_url)
      .setColor("#40BD66");
    await msg.channel.send(embed);
    return;
  };
}

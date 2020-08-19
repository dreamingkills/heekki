import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed, EmbedFieldData } from "discord.js";
import { ShopService } from "../../database/shop/Shop";

export class Command extends GameCommand {
  names: string[] = ["shop"];
  usage: string[] = ["%c [page]"];
  desc: string = "Shows you the shop.";
  category: string = "shop";

  exec = async (msg: Message) => {
    let page = this.prm[0] ? parseInt(this.prm[0]) : 1;

    let packs = await ShopService.getAllPacks(page);

    let desc: EmbedFieldData[] = [];
    for (let pack of packs) {
      desc.push({
        name: `${pack.name}`,
        value: `\`!shop buy ${pack.pack_id}\`\n<:coin:745447920072917093> ${pack.price}`,
        inline: true,
      });
    }
    let embed = new MessageEmbed()
      .setAuthor(`Shop - Active collections (page ${page})`)
      .addFields(desc)
      .setColor("#40BD66")
      .setThumbnail(msg.author.displayAvatarURL());
    await msg.channel.send(embed);
    return;
  };
}

import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed, EmbedFieldData } from "discord.js";
import { ShopService } from "../../database/service/ShopService";

export class Command extends GameCommand {
  names: string[] = ["shop"];
  usage: string[] = ["%c [page]"];
  desc: string = "Shows you the shop.";
  category: string = "shop";

  exec = async (msg: Message) => {
    let page = this.prm[0] ? parseInt(this.prm[0]) : 1;

    let packsRaw = await ShopService.getAllShopItems(true);
    let packs = packsRaw.slice(page * 9 - 9, page * 9);
    let desc: EmbedFieldData[] = [];
    for (let pack of packs) {
      desc.push({
        name: `${pack.title}`,
        value: `\`!buy ${pack.title}\`\n<:coin:745447920072917093> ${pack.price}`,
        inline: true,
      });
    }
    let embed = new MessageEmbed()
      .setAuthor(
        `Shop | ${msg.author.tag} (page ${page}/${Math.ceil(
          packsRaw.length / 9
        )})`
      )
      .addFields(desc)
      .setColor("#40BD66")
      .setThumbnail(msg.author.displayAvatarURL());
    msg.channel.send(embed);
  };
}

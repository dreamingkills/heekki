import { Message, MessageEmbed } from "discord.js";
import { ShopService } from "../../database/service/ShopService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["packs"];
  exec = async (msg: Message, executor: Profile) => {
    let page = this.options[0] ? parseInt(this.options[0]) : 1;

    let packsRaw = await ShopService.getAllShopItems(true);
    let packs = packsRaw.slice(page * 9 - 9, page * 9);
    let desc = [];
    for (let pack of packs) {
      desc.push({
        name: `<:cards:757151797235286089> ${pack.title}`,
        value: `<:cash:757146832639098930> **${pack.price}**\ncr. **${pack.credit}**\n\`!bp ${pack.keyword}\``,
        inline: true,
      });
    }
    let embed = new MessageEmbed()
      .setAuthor(
        `Shop | ${msg.author.tag} (page ${page}/${Math.ceil(
          packsRaw.length / 9
        )})`
      )
      .setDescription(
        `You have <:cash:757146832639098930> **${executor.coins}**.`
      )
      .addFields(desc)
      .setColor("#FFAACC")
      .setThumbnail(msg.author.displayAvatarURL());

    msg.channel.send(embed);
  };
}

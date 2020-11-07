import { Message, MessageEmbed } from "discord.js";
import { ShopService } from "../../database/service/ShopService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["packs"];
  async exec(msg: Message, executor: Profile) {
    let page = this.options[0] ? parseInt(this.options[0]) : 1;

    let packsRaw = await ShopService.getAllShopItems(true);
    let packs = packsRaw.slice(page * 15 - 15, page * 15);
    let desc = [];
    for (let pack of packs) {
      desc.push({
        name: `${this.config.discord.emoji.cards.full} ${pack.title}`,
        value: `${this.config.discord.emoji.cash.full} **${pack.price}**\ncr. **${pack.credit}**\n\`!bp ${pack.keyword}\``,
        inline: true,
      });
    }
    let embed = new MessageEmbed()
      .setAuthor(
        `Shop | ${msg.author.tag} (page ${page}/${Math.ceil(
          packsRaw.length / 9
        )})`,
        msg.author.displayAvatarURL()
      )
      .setDescription(
        `You have ${this.config.discord.emoji.cash.full} **${executor.coins}**.`
      )
      .addFields(desc)
      .setColor("#FFAACC")
      .setThumbnail(msg.author.displayAvatarURL());

    await msg.channel.send(embed);
  }
}
